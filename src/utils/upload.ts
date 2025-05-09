/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 11:48:23
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-05-08 17:15:46
 * @FilePath: \Antd-pro-Templete\src\utils\upload.ts
 * @Description: web直接上传
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import baidubce from '@baiducloud/sdk';
import { getFileMd5 } from './dealwithfile';
import { getAuth } from '@/services/common/api';

/**
 * 上传配置属性接口
 */
export interface ConfigProps {
  channel: 'oss' | 'cos' | 'bos' | 'server';
  host: string;
  path: string;
  bucket?: string;
  endPoint?: string;
  expiredTime: number;
  accessKeyId?: string;
  accessKeySecret?: string;
  securityToken?: string;
}

/**
 * 上传结果接口
 */
export interface UploadResult {
  url: string;
  success: boolean;
  fileName: string;
  fileSize: number;
  fileType: string;
  md5: string;
}

/**
 * 分块上传进度回调接口
 */
export interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * 上传认证信息的本地存储键
 */
const UPLOAD_DATA_KEY = 'uploadData';

/**
 * 认证过期时间提前量(毫秒)，避免使用即将过期的认证
 */
const EXPIRATION_BUFFER_TIME = 30 * 1000; // 30秒

/**
 * 最大重试次数
 */
const MAX_RETRY_COUNT = 3;

/**
 * 默认分块大小 (5MB)
 */
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

/**
 * 获取上传认证信息
 * @returns 认证信息
 */
export const getUploadAuth = async (): Promise<CommonType.AuthResponse> => {
  try {
    const { data } = await getAuth();
    localStorage.setItem(UPLOAD_DATA_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('获取上传认证失败:', error);
    throw error;
  }
};

/**
 * 检查上传认证是否过期
 * @returns 返回有效的认证信息
 */
const isExpired = async (): Promise<CommonType.AuthResponse> => {
  try {
    // 从本地存储获取上传数据
    const storage = localStorage.getItem(UPLOAD_DATA_KEY) || '{}';
    const uploadData: CommonType.AuthResponse = JSON.parse(storage);

    // 检查是否过期，并添加缓冲时间
    const now = Date.now();

    // 检查expiredTime是否为数字类型，如果不是，尝试转换或请求新token
    let expireTime: number;
    if (typeof uploadData.expiredTime === 'number') {
      expireTime = uploadData.expiredTime * 1000; // 转换为毫秒
    } else if (typeof uploadData.expiredTime === 'string') {
      // 尝试将字符串转换为数字
      expireTime = parseInt(uploadData.expiredTime, 10) * 1000;
      if (isNaN(expireTime)) {
        console.warn('无效的过期时间格式，将获取新认证', uploadData.expiredTime);
        return await getUploadAuth();
      }
    } else {
      // 没有有效的过期时间
      return await getUploadAuth();
    }

    const isTokenExpired = !uploadData.expiredTime || expireTime - now < EXPIRATION_BUFFER_TIME;

    if (isTokenExpired) {
      // 获取新的认证信息
      return await getUploadAuth();
    }

    return uploadData;
  } catch (error) {
    console.error('获取上传认证失败:', error);
    throw error;
  }
};

/**
 * 延迟执行
 * @param ms 延迟毫秒数
 */
const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

/**
 * 将文件分割成块
 * @param file 要分割的文件
 * @param chunkSize 每块的大小，默认5MB
 * @returns 包含所有块的数组
 */
const splitFileIntoChunks = (file: File, chunkSize = DEFAULT_CHUNK_SIZE): Blob[] => {
  if (!file || !(file instanceof File) || file.size === 0) {
    console.error('无效的文件对象', file);
    throw new Error('无效的文件对象');
  }

  console.log(`开始分割文件: ${file.name}, 大小: ${file.size} 字节, 分块大小: ${chunkSize} 字节`);

  const chunks: Blob[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    if (!chunk || chunk.size === 0) {
      console.warn(`创建的分块 #${chunkIndex} 无效或为空, 范围: ${start}-${end}`);
    } else {
      console.log(`创建分块 #${chunkIndex}: 范围 ${start}-${end}, 大小: ${chunk.size} 字节`);
      chunks.push(chunk);
    }

    start = end;
    chunkIndex++;
  }

  console.log(`文件分割完成，总共创建了 ${chunks.length} 个有效分块`);
  return chunks;
};

/**
 * 分块上传文件
 * @param file 要上传的文件
 * @param config 上传配置
 * @param onProgress 进度回调函数
 * @param retryCount 当前重试次数
 * @param chunkSize 分块大小（字节）
 * @param concurrentChunks 并发上传分块数量
 * @returns 上传结果
 */
const chunkUpload = async (
  file: File,
  config: ConfigProps,
  onProgress?: UploadProgressCallback,
  retryCount = 0,
  chunkSize = DEFAULT_CHUNK_SIZE,
  concurrentChunks = 3,
): Promise<UploadResult> => {
  const totalStartTime = Date.now();
  console.log(
    `[性能统计-开始] 文件: ${file.name}, 大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB, 开始上传处理`,
  );

  try {
    const {
      accessKeyId,
      accessKeySecret,
      securityToken,
      endPoint,
      bucket = '',
      path,
      host,
    } = config;

    // 确保必要参数存在
    if (!bucket) {
      throw new Error('缺少存储桶名称(bucket)');
    }

    // 获取文件MD5
    const md5StartTime = Date.now();
    console.log(`[性能统计] 开始计算文件MD5，时间: ${new Date(md5StartTime).toLocaleTimeString()}`);
    const { md5 } = await getFileMd5(file);
    const md5EndTime = Date.now();
    const md5TimeSpent = (md5EndTime - md5StartTime) / 1000;
    console.log(`[性能统计] 完成MD5计算: ${md5}, 耗时: ${md5TimeSpent.toFixed(2)}秒`);

    // 构建文件路径
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    const key = path + md5 + suffix;

    // 配置百度云存储客户端
    const bosConfig = {
      credentials: {
        ak: accessKeyId || '',
        sk: accessKeySecret || '',
      },
      sessionToken: securityToken,
      endpoint: endPoint || '',
      connectionTimeoutInMillis: 60000,
      receiveTimeoutInMillis: 60000,
    };

    const client = new baidubce.BosClient(bosConfig);

    // 获取并设置文件MIME类型
    const ext = key.split(/\./g).pop() || '';
    let mimeType = baidubce.MimeType.guess(ext);
    if (/^text\//.test(mimeType)) {
      mimeType += '; charset=UTF-8';
    }

    // 初始化分块上传
    const options = {
      'Content-Type': mimeType,
      'Cache-Control': 'max-age=31536000', // 缓存一年
    };

    const initStartTime = Date.now();
    console.log(
      `[性能统计] 开始初始化分块上传，文件: ${file.name}, 大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB, 分片大小: ${(chunkSize / (1024 * 1024)).toFixed(2)}MB, 并发数: ${concurrentChunks}`,
    );
    const initResult = await client.initiateMultipartUpload(bucket as string, key, options);
    const uploadId = initResult.body.uploadId;
    const initEndTime = Date.now();
    console.log(
      `[性能统计] 分块上传初始化成功: ${uploadId}, 耗时: ${((initEndTime - initStartTime) / 1000).toFixed(2)}秒`,
    );

    // 分割文件
    const splitStartTime = Date.now();
    const chunks = splitFileIntoChunks(file, chunkSize);
    const splitEndTime = Date.now();
    console.log(
      `[性能统计] 文件分割完成，共 ${chunks.length} 个分块, 耗时: ${((splitEndTime - splitStartTime) / 1000).toFixed(2)}秒`,
    );

    const partList: { partNumber: number; eTag: string }[] = [];
    const failedChunks: number[] = [];
    const chunkTimeRecords: { [key: number]: { start: number; end: number } } = {};

    // 创建一个控制并发的函数
    const uploadStartTime = Date.now();
    console.log(`[性能统计] 开始上传分块，时间: ${new Date(uploadStartTime).toLocaleTimeString()}`);

    const uploadChunksWithConcurrency = async () => {
      let completedSize = 0;
      let activeUploads = 0;
      let nextChunkIndex = 0;

      return new Promise<void>((resolve) => {
        // 上传单个分块的函数
        const uploadChunk = async (chunkIndex: number) => {
          if (chunkIndex >= chunks.length) {
            // 所有分块已经开始上传
            if (activeUploads === 0) {
              resolve();
            }
            return;
          }

          activeUploads++;
          const chunk = chunks[chunkIndex];
          const partNumber = chunkIndex + 1;
          nextChunkIndex++;

          try {
            // 验证分块有效性
            if (!chunk || !(chunk instanceof Blob)) {
              throw new Error(`无效的分块数据，分块索引: ${chunkIndex}`);
            }

            const chunkStartTime = Date.now();
            chunkTimeRecords[partNumber] = { start: chunkStartTime, end: 0 };
            console.log(
              `[性能统计] 开始上传分块 ${partNumber}/${chunks.length}, 大小: ${(chunk.size / (1024 * 1024)).toFixed(2)}MB`,
            );

            // 上传分块
            try {
              const partResult = await client.uploadPartFromBlob(
                bucket as string,
                key,
                uploadId,
                partNumber,
                chunk.size,
                chunk,
              );

              const chunkEndTime = Date.now();
              chunkTimeRecords[partNumber].end = chunkEndTime;
              const chunkTimeSpent = (chunkEndTime - chunkStartTime) / 1000;
              const chunkSpeed = chunk.size / 1024 / 1024 / chunkTimeSpent;

              // 添加到分块列表
              partList.push({
                partNumber,
                eTag: partResult.http_headers.etag.replace(/"/g, ''),
              });

              console.log(
                `[性能统计] 分块 ${partNumber}/${chunks.length} 上传完成，耗时: ${chunkTimeSpent.toFixed(2)}秒, 速度: ${chunkSpeed.toFixed(2)}MB/s`,
              );
            } catch (partError) {
              const chunkEndTime = Date.now();
              chunkTimeRecords[partNumber].end = chunkEndTime;
              const chunkTimeSpent = (chunkEndTime - chunkStartTime) / 1000;

              console.error(
                `[性能统计] 分块 ${partNumber} 上传失败, 耗时: ${chunkTimeSpent.toFixed(2)}秒:`,
                partError,
              );
              failedChunks.push(chunkIndex);
              // 不终止整个上传过程，让其他分块继续上传
            }

            // 更新进度
            completedSize += chunk.size;
            if (onProgress) {
              const progress = Math.floor((completedSize / file.size) * 100);
              onProgress(progress);
            }

            activeUploads--;

            // 尝试上传下一个分块
            uploadChunk(nextChunkIndex);

            // 如果所有上传都完成，解析promise
            if (activeUploads === 0 && nextChunkIndex >= chunks.length) {
              resolve();
            }
          } catch (error) {
            failedChunks.push(chunkIndex);
            activeUploads--;

            // 尝试上传下一个分块
            uploadChunk(nextChunkIndex);

            // 如果所有上传都完成，解析promise
            if (activeUploads === 0 && nextChunkIndex >= chunks.length) {
              resolve();
            }
          }
        };

        // 启动初始的并发上传
        const initialConcurrent = Math.min(concurrentChunks, chunks.length);
        for (let i = 0; i < initialConcurrent; i++) {
          uploadChunk(i);
        }
      });
    };

    // 并发上传所有分块
    await uploadChunksWithConcurrency();
    const uploadEndTime = Date.now();
    const uploadTimeSpent = (uploadEndTime - uploadStartTime) / 1000;
    console.log(
      `[性能统计] 所有分块上传完成，总耗时: ${uploadTimeSpent.toFixed(2)}秒, 平均速度: ${(file.size / 1024 / 1024 / uploadTimeSpent).toFixed(2)}MB/s`,
    );

    // 分析分块上传性能
    const chunkTimes = Object.entries(chunkTimeRecords).map(([partNumber, times]) => {
      const timeSpent = (times.end - times.start) / 1000;
      const chunkSize = chunks[parseInt(partNumber) - 1].size;
      return {
        partNumber: parseInt(partNumber),
        timeSpent,
        chunkSize,
        speed: chunkSize / 1024 / 1024 / timeSpent,
      };
    });

    const avgTime = chunkTimes.reduce((sum, chunk) => sum + chunk.timeSpent, 0) / chunkTimes.length;
    const maxTime = Math.max(...chunkTimes.map((chunk) => chunk.timeSpent));
    const minTime = Math.min(...chunkTimes.map((chunk) => chunk.timeSpent));
    const avgSpeed = chunkTimes.reduce((sum, chunk) => sum + chunk.speed, 0) / chunkTimes.length;

    console.log(`[性能统计] 分块上传详细统计:
    - 平均耗时: ${avgTime.toFixed(2)}秒/块
    - 最大耗时: ${maxTime.toFixed(2)}秒
    - 最小耗时: ${minTime.toFixed(2)}秒
    - 平均速度: ${avgSpeed.toFixed(2)}MB/s`);

    // 检查是否所有分块都上传成功
    if (failedChunks.length > 0) {
      console.error(`[性能统计] 有 ${failedChunks.length} 个分块上传失败，分块编号:`, failedChunks);
      throw new Error('部分分块上传失败');
    }

    // 按照partNumber排序
    partList.sort((a, b) => a.partNumber - b.partNumber);

    // 检查是否有缺失的分块
    if (partList.length !== chunks.length) {
      console.error(
        `[性能统计] 分块数量不匹配: 预期 ${chunks.length}, 实际上传 ${partList.length}`,
      );
      throw new Error('分块数量不匹配');
    }

    // 完成分块上传
    const completeStartTime = Date.now();
    console.log(`[性能统计] 开始合并分块，总数: ${partList.length}`);

    // 格式化parts列表，确保eTag没有引号
    const formattedParts = partList.map((part) => ({
      partNumber: part.partNumber,
      eTag: part.eTag.replace(/"/g, ''), // 移除可能的引号
    }));

    // 尝试不同的格式
    try {
      // 1. 尝试直接传递parts数组
      await client.completeMultipartUpload(bucket as string, key, uploadId, formattedParts);
    } catch (error1: any) {
      console.warn('[性能统计] 第一种格式尝试失败:', error1.message);

      try {
        // 2. 尝试传递 {parts: [...]} 格式的对象
        await client.completeMultipartUpload(bucket as string, key, uploadId, {
          parts: formattedParts,
        });
      } catch (error2: any) {
        console.warn('[性能统计] 第二种格式尝试失败:', error2.message);

        try {
          // 3. 尝试使用JSON字符串
          const jsonBody = JSON.stringify({
            parts: formattedParts,
          });
          await client.completeMultipartUpload(bucket as string, key, uploadId, jsonBody);
        } catch (error3: any) {
          console.error('[性能统计] 所有格式都失败，错误:', error3);

          // 记录详细错误信息
          if (error3.response) {
            console.error('[性能统计] 错误响应:', {
              status: error3.response.status,
              headers: error3.response.headers,
              data: error3.response.data,
            });
          }

          throw error3;
        }
      }
    }

    const completeEndTime = Date.now();
    console.log(
      `[性能统计] 分块合并完成，耗时: ${((completeEndTime - completeStartTime) / 1000).toFixed(2)}秒`,
    );

    // 总时间统计
    const totalEndTime = Date.now();
    const totalTimeSpent = (totalEndTime - totalStartTime) / 1000;
    console.log(`[性能统计-完成] 文件: ${file.name} 上传完成，总耗时: ${totalTimeSpent.toFixed(2)}秒，详细耗时:
    - MD5计算: ${md5TimeSpent.toFixed(2)}秒 (${((md5TimeSpent / totalTimeSpent) * 100).toFixed(2)}%)
    - 分块上传: ${uploadTimeSpent.toFixed(2)}秒 (${((uploadTimeSpent / totalTimeSpent) * 100).toFixed(2)}%)
    - 分块合并: ${((completeEndTime - completeStartTime) / 1000).toFixed(2)}秒 (${(((completeEndTime - completeStartTime) / 1000 / totalTimeSpent) * 100).toFixed(2)}%)
    - 其他操作: ${(totalTimeSpent - md5TimeSpent - uploadTimeSpent - (completeEndTime - completeStartTime) / 1000).toFixed(2)}秒
    - 总传输速度: ${(file.size / 1024 / 1024 / totalTimeSpent).toFixed(2)}MB/s`);

    // 返回上传结果
    return {
      url: host + key,
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      md5,
    };
  } catch (error) {
    const totalEndTime = Date.now();
    console.error(
      `[性能统计-失败] 文件: ${file.name} 上传失败，总耗时: ${((totalEndTime - totalStartTime) / 1000).toFixed(2)}秒, 错误:`,
      error,
    );

    // 自动重试逻辑
    if (retryCount < MAX_RETRY_COUNT) {
      // 指数退避策略，避免立即重试
      const delayTime = Math.pow(2, retryCount) * 1000;

      console.log(`[性能统计] 将在 ${delayTime}ms 后重试分块上传...`);
      await delay(delayTime);

      // 如果是认证问题，刷新认证
      try {
        const freshConfig = await isExpired();
        // 合并配置，确保使用最新的认证信息
        const updatedConfig = { ...config, ...freshConfig };

        // 重试上传
        return await chunkUpload(
          file,
          updatedConfig,
          onProgress,
          retryCount + 1,
          chunkSize,
          concurrentChunks,
        );
      } catch (refreshError) {
        console.error('[性能统计] 刷新认证失败，继续使用原配置重试:', refreshError);
        return await chunkUpload(
          file,
          config,
          onProgress,
          retryCount + 1,
          chunkSize,
          concurrentChunks,
        );
      }
    }

    // 已达到最大重试次数，抛出异常
    throw error;
  }
};

/**
 * 自定义上传文件，支持自动重试
 * @param file 需要上传的文件
 * @param config 上传配置
 * @param retryCount 当前重试次数
 * @param useChunkUpload 是否使用分块上传
 * @param chunkSizeThreshold 分块上传的文件大小阈值（字节）
 * @param chunkSize 分块大小（字节）
 * @param concurrentChunks 并发上传分块数量
 * @param onProgress 进度回调函数
 * @returns 返回上传结果，包含文件URL
 */
const customUpload = async (
  file: File,
  config: ConfigProps,
  retryCount = 0,
  useChunkUpload = false,
  chunkSizeThreshold = DEFAULT_CHUNK_SIZE,
  chunkSize = DEFAULT_CHUNK_SIZE,
  concurrentChunks = 3,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> => {
  const totalStartTime = Date.now();
  console.log(
    `[性能统计-开始] 文件: ${file.name}, 大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB, 准备上传`,
  );

  // 参数验证
  if (!file || !(file instanceof File)) {
    throw new Error('无效的文件对象');
  }

  if (!config) {
    throw new Error('缺少上传配置');
  }

  const { accessKeyId, accessKeySecret, bucket = '', endPoint = '' } = config;

  // 验证必要的配置参数
  if (!accessKeyId || !accessKeySecret) {
    throw new Error('缺少访问凭证(accessKeyId/accessKeySecret)');
  }

  if (!bucket) {
    throw new Error('缺少存储桶名称(bucket)');
  }

  if (!endPoint) {
    throw new Error('缺少服务端点(endPoint)');
  }

  // 判断是否使用分块上传
  if (useChunkUpload && file.size > chunkSizeThreshold) {
    console.log(
      `[性能统计] 文件大小(${(file.size / (1024 * 1024)).toFixed(2)}MB)超过阈值(${(chunkSizeThreshold / (1024 * 1024)).toFixed(2)}MB)，使用分块上传，分块大小: ${(chunkSize / (1024 * 1024)).toFixed(2)}MB，并发数: ${concurrentChunks}`,
    );
    return chunkUpload(file, config, onProgress, retryCount, chunkSize, concurrentChunks);
  }

  // 使用普通上传方式
  try {
    console.log(`[性能统计] 使用普通上传方式处理文件: ${file.name}`);
    const {
      accessKeyId,
      accessKeySecret,
      securityToken,
      endPoint = '',
      bucket = '',
      path,
      host,
    } = config;

    // 获取文件MD5
    const md5StartTime = Date.now();
    console.log(`[性能统计] 开始计算文件MD5，时间: ${new Date(md5StartTime).toLocaleTimeString()}`);
    const { md5 } = await getFileMd5(file);
    const md5EndTime = Date.now();
    const md5TimeSpent = (md5EndTime - md5StartTime) / 1000;
    console.log(`[性能统计] 完成MD5计算: ${md5}, 耗时: ${md5TimeSpent.toFixed(2)}秒`);

    // 构建文件路径
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    const url = path + md5 + suffix;

    // 配置百度云存储客户端
    const bosConfig = {
      credentials: {
        ak: accessKeyId || '',
        sk: accessKeySecret || '',
      },
      sessionToken: securityToken,
      endpoint: endPoint,
      connectionTimeoutInMillis: 60000,
      receiveTimeoutInMillis: 60000,
    };

    console.log(`[性能统计] 创建BOS客户端连接: 端点=${endPoint}, 存储桶=${bucket}`);
    const client = new baidubce.BosClient(bosConfig);

    // 获取并设置文件MIME类型
    const ext = url.split(/\./g).pop() || '';
    let mimeType = baidubce.MimeType.guess(ext);
    if (/^text\//.test(mimeType)) {
      mimeType += '; charset=UTF-8';
    }

    console.log(
      `[性能统计] 上传文件: ${file.name}, 类型: ${mimeType}, 大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    );

    // 对于小文件，也使用分块上传API，但只上传一个分块
    // 初始化分块上传
    const initStartTime = Date.now();
    const options = {
      'Content-Type': mimeType,
      'Cache-Control': 'max-age=31536000', // 缓存一年
    };

    const initResult = await client.initiateMultipartUpload(bucket as string, url, options);
    const uploadId = initResult.body.uploadId;
    const initEndTime = Date.now();
    console.log(
      `[性能统计] 小文件分块上传初始化成功: ${uploadId}, 耗时: ${((initEndTime - initStartTime) / 1000).toFixed(2)}秒`,
    );

    // 尝试上传单个分块
    const uploadStartTime = Date.now();
    const partNumber = 1;

    // 上传文件
    console.log(`[性能统计] 开始上传小文件，大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    const partResult = await client.uploadPartFromBlob(
      bucket as string,
      url,
      uploadId,
      partNumber,
      file.size,
      file,
    );

    const uploadEndTime = Date.now();
    const uploadTimeSpent = (uploadEndTime - uploadStartTime) / 1000;
    const uploadSpeed = file.size / 1024 / 1024 / uploadTimeSpent;
    console.log(
      `[性能统计] 小文件上传完成，耗时: ${uploadTimeSpent.toFixed(2)}秒, 速度: ${uploadSpeed.toFixed(2)}MB/s`,
    );

    // 完成分块上传
    const completeStartTime = Date.now();
    const partList = [
      {
        partNumber: partNumber,
        eTag: partResult.http_headers.etag.replace(/"/g, ''), // 移除可能的引号
      },
    ];

    console.log(`[性能统计] 小文件分块列表: ${JSON.stringify(partList)}`);

    try {
      // 1. 尝试直接传递parts数组
      await client.completeMultipartUpload(bucket as string, url, uploadId, partList);
    } catch (error1: any) {
      console.warn('[性能统计] 小文件合并-第一种格式尝试失败:', error1.message);

      try {
        // 2. 尝试传递 {parts: [...]} 格式的对象
        await client.completeMultipartUpload(bucket as string, url, uploadId, {
          parts: partList,
        });
      } catch (error2: any) {
        console.warn('[性能统计] 小文件合并-第二种格式尝试失败:', error2.message);

        try {
          // 3. 尝试使用JSON字符串
          const jsonBody = JSON.stringify({
            parts: partList,
          });
          console.log('[性能统计] 小文件-使用字符串JSON格式:', jsonBody);
          await client.completeMultipartUpload(bucket as string, url, uploadId, jsonBody);
        } catch (error3: any) {
          console.error('[性能统计] 小文件-所有格式都失败，错误:', error3);

          // 记录详细错误信息
          if (error3.response) {
            console.error('[性能统计] 小文件-错误响应:', {
              status: error3.response.status,
              headers: error3.response.headers,
              data: error3.response.data,
            });
          }

          throw error3;
        }
      }
    }
    const completeEndTime = Date.now();
    console.log(
      `[性能统计] 小文件分块合并完成，耗时: ${((completeEndTime - completeStartTime) / 1000).toFixed(2)}秒`,
    );

    // 更新进度
    if (onProgress) {
      onProgress(100);
    }

    // 总时间统计
    const totalEndTime = Date.now();
    const totalTimeSpent = (totalEndTime - totalStartTime) / 1000;
    console.log(`[性能统计-完成] 文件: ${file.name} 上传完成，总耗时: ${totalTimeSpent.toFixed(2)}秒，详细耗时:
    - MD5计算: ${md5TimeSpent.toFixed(2)}秒 (${((md5TimeSpent / totalTimeSpent) * 100).toFixed(2)}%)
    - 上传操作: ${uploadTimeSpent.toFixed(2)}秒 (${((uploadTimeSpent / totalTimeSpent) * 100).toFixed(2)}%)
    - 分块合并: ${((completeEndTime - completeStartTime) / 1000).toFixed(2)}秒 (${(((completeEndTime - completeStartTime) / 1000 / totalTimeSpent) * 100).toFixed(2)}%)
    - 其他操作: ${(totalTimeSpent - md5TimeSpent - uploadTimeSpent - (completeEndTime - completeStartTime) / 1000).toFixed(2)}秒
    - 总传输速度: ${(file.size / 1024 / 1024 / totalTimeSpent).toFixed(2)}MB/s`);

    // 返回上传结果
    return {
      url: host + url,
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      md5,
    };
  } catch (error) {
    const totalEndTime = Date.now();
    console.error(
      `[性能统计-失败] 文件: ${file.name} 上传失败，总耗时: ${((totalEndTime - totalStartTime) / 1000).toFixed(2)}秒, 错误:`,
      error,
    );

    // 自动重试逻辑
    if (retryCount < MAX_RETRY_COUNT) {
      // 指数退避策略，避免立即重试
      const delayTime = Math.pow(2, retryCount) * 1000;

      console.log(`[性能统计] 将在 ${delayTime}ms 后重试上传...`);
      await delay(delayTime);

      // 如果是认证问题，刷新认证
      try {
        const freshConfig = await isExpired();
        // 合并配置，确保使用最新的认证信息
        const updatedConfig = { ...config, ...freshConfig };

        // 重试上传
        return await customUpload(
          file,
          updatedConfig,
          retryCount + 1,
          useChunkUpload,
          chunkSizeThreshold,
          chunkSize,
          concurrentChunks,
          onProgress,
        );
      } catch (refreshError) {
        console.error('[性能统计] 刷新认证失败，继续使用原配置重试:', refreshError);
        return await customUpload(
          file,
          config,
          retryCount + 1,
          useChunkUpload,
          chunkSizeThreshold,
          chunkSize,
          concurrentChunks,
          onProgress,
        );
      }
    }

    // 已达到最大重试次数，抛出异常
    throw error;
  }
};

/**
 * 批量上传文件
 * @param files 文件列表
 * @param config 上传配置
 * @param onProgress 上传进度回调
 * @param useChunkUpload 是否使用分块上传
 * @param chunkSizeThreshold 分块上传的文件大小阈值（字节）
 * @returns 上传结果列表
 */
const batchUpload = async (
  files: File[],
  config: ConfigProps,
  onProgress?: (current: number, total: number) => void,
  useChunkUpload = false,
  chunkSizeThreshold = DEFAULT_CHUNK_SIZE,
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    try {
      const file = files[i];
      const result = await customUpload(
        file,
        config,
        0,
        useChunkUpload,
        chunkSizeThreshold,
        DEFAULT_CHUNK_SIZE,
        3,
        (progress) => {
          // 计算总体进度
          const currentFileProgress = progress / 100;
          const totalProgress = (i + currentFileProgress) / total;
          if (onProgress) {
            onProgress(Math.floor(totalProgress * 100), 100);
          }
        },
      );
      results.push(result);

      // 报告进度
      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      // 单个文件上传失败继续处理其他文件
      console.error(`第 ${i + 1} 个文件上传失败:`, error);
      results.push({
        url: '',
        success: false,
        fileName: files[i].name,
        fileSize: files[i].size,
        fileType: files[i].type,
        md5: '',
      });

      // 报告进度
      if (onProgress) {
        onProgress(i + 1, total);
      }
    }
  }

  return results;
};

export { customUpload, batchUpload, isExpired };
