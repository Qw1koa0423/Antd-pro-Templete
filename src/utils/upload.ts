/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 11:48:23
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-05-14 15:48:29
 * @FilePath: \Antd-pro-Templete\src\utils\upload.ts
 * @Description: web直接上传
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import baidubce from '@baiducloud/sdk';
import { getFileMd5 } from './dealwithfile';
import { getAuth, uploadFile as uploadFileService } from '@/services/common/api';
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
 * 根据文件大小确定分片大小
 * @param fileSize 文件大小（字节）
 * @returns 分片大小（字节）
 */
const getChunkSizeByFileSize = (fileSize: number): number => {
  const MB = 1024 * 1024;

  // 根据不同大小范围返回不同的分片大小
  if (fileSize <= 5 * MB) {
    // 0-5M，不分片，返回文件本身大小
    return fileSize;
  } else if (fileSize <= 20 * MB) {
    // 5-20M，每个分片大小1M
    return 1 * MB;
  } else if (fileSize <= 50 * MB) {
    // 20-50M，每个分片大小2M
    return 2 * MB;
  } else if (fileSize <= 100 * MB) {
    // 50-100M，每个分片大小4M
    return 4 * MB;
  } else if (fileSize <= 200 * MB) {
    // 100-200M，每个分片大小6M
    return 6 * MB;
  } else if (fileSize <= 500 * MB) {
    // 200-500M，每个分片大小10M
    return 10 * MB;
  } else if (fileSize <= 2048 * MB) {
    // 500M-2048M，每个分片大小20M
    return 20 * MB;
  } else if (fileSize <= 4096 * MB) {
    // 2048M-4096M，每个分片大小40M
    return 40 * MB;
  } else {
    // 4096M以上，最大100个分片
    const maxChunkNumber = Math.min(Math.ceil(fileSize / (50 * MB)), 104);
    return fileSize / maxChunkNumber;
  }
};

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

  const chunks: Blob[] = [];
  let start = 0;

  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    if (chunk && chunk.size !== 0) {
      chunks.push(chunk);
    }

    start = end;
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
  chunkSizeParam?: number,
  concurrentChunks = 3,
): Promise<UploadResult> => {
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

    // 如果未指定分块大小或分块大小为0，根据文件大小计算适合的分块大小
    let actualChunkSize = chunkSizeParam || 0;
    if (!actualChunkSize || actualChunkSize === 0) {
      actualChunkSize = getChunkSizeByFileSize(file.size);
    }

    const md5Result = await getFileMd5(file);
    const { md5, md5Promise, tempId } = md5Result;

    let finalMd5 = md5;
    let usingTempId = !!tempId;

    // 构建临时文件路径（使用临时ID或已计算完成的MD5）
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    const fileKey = path + (usingTempId ? tempId : md5) + suffix;

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
    const ext = fileKey.split(/\./g).pop() || '';
    let mimeType = baidubce.MimeType.guess(ext);
    if (/^text\//.test(mimeType)) {
      mimeType += '; charset=UTF-8';
    }

    // 初始化分块上传
    const options = {
      'Content-Type': mimeType,
      'Cache-Control': 'max-age=31536000', // 缓存一年
    };

    const initResult = await client.initiateMultipartUpload(bucket as string, fileKey, options);
    const uploadId = initResult.body.uploadId;

    // 分割文件
    const chunks = splitFileIntoChunks(file, actualChunkSize);

    const partList: { partNumber: number; eTag: string }[] = [];
    const failedChunks: number[] = [];
    const chunkTimeRecords: { [key: number]: { start: number; end: number } } = {};

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

            // 上传分块
            try {
              const partResult = await client.uploadPartFromBlob(
                bucket as string,
                fileKey,
                uploadId,
                partNumber,
                chunk.size,
                chunk,
              );

              const chunkEndTime = Date.now();
              chunkTimeRecords[partNumber].end = chunkEndTime;

              // 添加到分块列表
              partList.push({
                partNumber,
                eTag: partResult.http_headers.etag.replace(/"/g, ''),
              });
            } catch (partError) {
              const chunkEndTime = Date.now();
              chunkTimeRecords[partNumber].end = chunkEndTime;

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

    // 检查是否所有分块都上传成功
    if (failedChunks.length > 0) {
      throw new Error('部分分块上传失败');
    }

    // 按照partNumber排序
    partList.sort((a, b) => a.partNumber - b.partNumber);

    // 检查是否有缺失的分块
    if (partList.length !== chunks.length) {
      throw new Error('分块数量不匹配');
    }

    // 格式化parts列表，确保eTag没有引号
    const formattedParts = partList.map((part) => ({
      partNumber: part.partNumber,
      eTag: part.eTag.replace(/"/g, ''), // 移除可能的引号
    }));

    // 尝试不同的格式
    try {
      // 1. 尝试直接传递parts数组
      await client.completeMultipartUpload(bucket as string, fileKey, uploadId, formattedParts);
    } catch (error1: any) {
      try {
        await client.completeMultipartUpload(bucket as string, fileKey, uploadId, {
          parts: formattedParts,
        });
      } catch (error2: any) {
        try {
          // 3. 尝试使用JSON字符串
          const jsonBody = JSON.stringify({
            parts: formattedParts,
          });
          await client.completeMultipartUpload(bucket as string, fileKey, uploadId, jsonBody);
        } catch (error3: any) {
          console.error('分块上传失败:', error3);
        }
      }
    }

    // 如果正在使用临时ID，等待真正的MD5计算完成
    if (usingTempId && md5Promise) {
      // 等待MD5计算完成
      finalMd5 = await md5Promise;

      console.log(`[性能统计] MD5计算已完成: ${finalMd5}`);

      // 保存完整MD5值到文件对象，使用类型断言避免TS错误
      const fileWithMd5 = file as File & { md5?: string };
      if (fileWithMd5.md5 !== finalMd5) {
        fileWithMd5.md5 = finalMd5;
      }
    }

    // 返回上传结果，URL使用临时ID构建的路径，MD5使用完整的计算结果
    const uploadPath = path + (usingTempId ? tempId : md5) + suffix;
    return {
      url: host + uploadPath,
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      md5: finalMd5,
    };
  } catch (error) {
    // 自动重试逻辑
    if (retryCount < MAX_RETRY_COUNT) {
      // 指数退避策略，避免立即重试
      const delayTime = Math.pow(2, retryCount) * 1000;

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
          chunkSizeParam,
          concurrentChunks,
        );
      } catch (refreshError) {
        console.error('[性能统计] 刷新认证失败，继续使用原配置重试:', refreshError);
        return await chunkUpload(
          file,
          config,
          onProgress,
          retryCount + 1,
          chunkSizeParam,
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
 * @param chunkSizeParam 分块大小（字节），如果未指定，则根据文件大小自动确定
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
  chunkSizeParam?: number,
  concurrentChunks = 3,
  onProgress?: UploadProgressCallback,
): Promise<UploadResult> => {
  // 参数验证
  if (!file || !(file instanceof File)) {
    throw new Error('无效的文件对象');
  }

  if (!config) {
    throw new Error('缺少上传配置');
  }

  // 获取上传通道类型
  const { channel = 'bos' } = config;

  // 根据不同的上传通道选择不同的上传方法
  switch (channel) {
    case 'bos': {
      // 百度云BOS上传（现有实现）
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

      // 如果未指定分块大小，根据文件大小自动确定
      const actualChunkSize = chunkSizeParam || getChunkSizeByFileSize(file.size);

      // 判断是否使用分块上传
      if (useChunkUpload && file.size > chunkSizeThreshold) {
        return chunkUpload(file, config, onProgress, retryCount, actualChunkSize, concurrentChunks);
      }

      // 使用普通上传方式
      try {
        const {
          accessKeyId,
          accessKeySecret,
          securityToken,
          endPoint = '',
          bucket = '',
          path,
          host,
        } = config;

        const md5Result = await getFileMd5(file);
        const { md5, md5Promise, tempId } = md5Result;

        // 对于小文件，md5Promise应该已经完成，不需要后续处理
        // 对于中等大小文件(>10MB但<文件分块阈值)，可能需要使用tempId
        const isMediumFile = file.size > 10 * 1024 * 1024 && file.size <= chunkSizeThreshold;
        let finalMd5 = md5;
        let usingTempId = !!tempId && isMediumFile;

        // 构建文件路径（使用临时ID或已计算完成的MD5）
        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        const fileKey = path + (usingTempId ? tempId : md5) + suffix;

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

        const client = new baidubce.BosClient(bosConfig);

        // 获取并设置文件MIME类型
        const ext = fileKey.split(/\./g).pop() || '';
        let mimeType = baidubce.MimeType.guess(ext);
        if (/^text\//.test(mimeType)) {
          mimeType += '; charset=UTF-8';
        }

        // 对于小文件，也使用分块上传API，但只上传一个分块
        // 初始化分块上传
        const options = {
          'Content-Type': mimeType,
          'Cache-Control': 'max-age=31536000', // 缓存一年
        };

        const initResult = await client.initiateMultipartUpload(bucket as string, fileKey, options);
        const uploadId = initResult.body.uploadId;

        const partNumber = 1;

        // 上传文件
        const partResult = await client.uploadPartFromBlob(
          bucket as string,
          fileKey,
          uploadId,
          partNumber,
          file.size,
          file,
        );

        // 完成分块上传
        const partList = [
          {
            partNumber: partNumber,
            eTag: partResult.http_headers.etag.replace(/"/g, ''), // 移除可能的引号
          },
        ];

        try {
          // 1. 尝试直接传递parts数组
          await client.completeMultipartUpload(bucket as string, fileKey, uploadId, partList);
        } catch (error1: any) {
          try {
            // 2. 尝试传递 {parts: [...]} 格式的对象
            await client.completeMultipartUpload(bucket as string, fileKey, uploadId, {
              parts: partList,
            });
          } catch (error2: any) {
            try {
              // 3. 尝试使用JSON字符串
              const jsonBody = JSON.stringify({
                parts: partList,
              });
              await client.completeMultipartUpload(bucket as string, fileKey, uploadId, jsonBody);
            } catch (error3: any) {
              // 记录详细错误信息
              if (error3.response) {
              }

              throw error3;
            }
          }
        }

        // 更新进度
        if (onProgress) {
          onProgress(100);
        }

        // 如果正在使用临时ID，等待真正的MD5计算完成
        if (usingTempId && md5Promise) {
          // 等待MD5计算完成
          finalMd5 = await md5Promise;

          // 保存完整MD5值到文件对象，使用类型断言避免TS错误
          const fileWithMd5 = file as File & { md5?: string };
          if (fileWithMd5.md5 !== finalMd5) {
            fileWithMd5.md5 = finalMd5;
          }
        }

        // 返回上传结果，URL使用临时ID构建的路径，MD5使用完整的计算结果
        const uploadPath = path + (usingTempId ? tempId : md5) + suffix;
        return {
          url: host + uploadPath,
          success: true,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          md5: finalMd5,
        };
      } catch (error) {
        // 自动重试逻辑
        if (retryCount < MAX_RETRY_COUNT) {
          // 指数退避策略，避免立即重试
          const delayTime = Math.pow(2, retryCount) * 1000;

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
              chunkSizeParam,
              concurrentChunks,
              onProgress,
            );
          } catch (refreshError) {
            return await customUpload(
              file,
              config,
              retryCount + 1,
              useChunkUpload,
              chunkSizeThreshold,
              chunkSizeParam,
              concurrentChunks,
              onProgress,
            );
          }
        }

        // 已达到最大重试次数，抛出异常
        throw error;
      }
    }

    case 'oss': {
      // 阿里云OSS上传预留接口

      // 获取和验证必要参数
      const { accessKeyId, accessKeySecret, bucket = '', endPoint = '', path, host } = config;

      console.log(host);
      if (!accessKeyId || !accessKeySecret || !bucket || !endPoint) {
        throw new Error('缺少OSS必要的配置参数');
      }

      const md5Result = await getFileMd5(file);
      const { md5, md5Promise, tempId } = md5Result;

      // 构建文件路径
      const suffix = file.name.slice(file.name.lastIndexOf('.'));
      const fileKey = path + md5 + suffix;
      console.log(md5Promise, tempId, fileKey);
      // TODO: 实现OSS上传逻辑
      // 如果需要分块上传
      if (useChunkUpload && file.size > chunkSizeThreshold) {
        // TODO: 实现OSS分块上传
      } else {
        // TODO: 实现OSS普通上传
      }

      // 临时返回模拟结果
      throw new Error('阿里云OSS上传功能尚未实现');
    }

    case 'cos': {
      // 腾讯云COS上传预留接口

      // 获取和验证必要参数
      const { accessKeyId, accessKeySecret, bucket = '', endPoint = '', path, host } = config;

      if (!accessKeyId || !accessKeySecret || !bucket || !endPoint) {
        throw new Error('缺少COS必要的配置参数');
      }

      // MD5计算逻辑保持一致
      const md5StartTime = Date.now();
      console.log(
        `[性能统计] 开始计算文件MD5，时间: ${new Date(md5StartTime).toLocaleTimeString()}`,
      );
      const md5Result = await getFileMd5(file);
      const { md5, md5Promise, tempId } = md5Result;

      // 构建文件路径
      const suffix = file.name.slice(file.name.lastIndexOf('.'));
      const fileKey = path + md5 + suffix;

      console.log(host, md5Promise, tempId, fileKey);
      // TODO: 实现COS上传逻辑
      // 如果需要分块上传
      if (useChunkUpload && file.size > chunkSizeThreshold) {
        console.log(
          `[COS上传] 文件大小${(file.size / (1024 * 1024)).toFixed(2)}MB超过阈值，使用COS分块上传`,
        );
        // TODO: 实现COS分块上传
      } else {
        console.log(`[COS上传] 使用COS普通上传`);
        // TODO: 实现COS普通上传
      }

      // 临时返回模拟结果
      throw new Error('腾讯云COS上传功能尚未实现');
    }

    case 'server': {
      // 自定义服务器上传预留接口

      // 获取和验证必要参数
      const { path, host } = config;

      // MD5计算逻辑保持一致 for the whole file
      const overallFileMd5Result = await getFileMd5(file);
      const {
        md5: overallFileMd5,
        md5Promise: overallFileMd5Promise,
        tempId: overallFileTempId,
      } = overallFileMd5Result;
      let finalOverallMd5 = overallFileMd5;
      let usingOverallTempId = !!overallFileTempId;

      if (usingOverallTempId) {
        console.log(
          `[性能统计][Server] 使用临时ID进行上传: ${overallFileTempId}，完整文件MD5计算将在后台继续进行`,
        );
      } else {
        console.log(`[性能统计][Server] 完成完整文件MD5计算: ${overallFileMd5}`);
      }

      // 构建文件路径
      const suffix = file.name.slice(file.name.lastIndexOf('.'));
      // Ensure suffix starts with a dot if it exists, or is an empty string
      const normalizedSuffix =
        suffix && suffix.startsWith('.') ? suffix : suffix ? `.${suffix}` : '';
      const fileKey =
        path + (usingOverallTempId ? overallFileTempId : overallFileMd5) + normalizedSuffix;

      // 如果需要分块上传
      if (useChunkUpload && file.size > chunkSizeThreshold) {
        console.log(
          `[Server上传] 文件大小(${(file.size / (1024 * 1024)).toFixed(2)}MB)超过阈值(${
            chunkSizeThreshold / (1024 * 1024)
          }MB)，使用服务器分块上传。指定分块大小: ${chunkSizeParam ? `${chunkSizeParam / (1024 * 1024)}MB` : '未指定'}, 并发数: ${concurrentChunks}`,
        );

        // 确定分片大小: 优先使用 chunkSizeParam (来自组件的 chunkSize prop), 否则使用默认值

        const actualChunkSize = chunkSizeParam || getChunkSizeByFileSize(file.size);
        const chunks = splitFileIntoChunks(file, actualChunkSize);
        const totalChunks = chunks.length;
        let uploadedBytes = 0;

        const uploadChunk = async (chunk: Blob, index: number): Promise<void> => {
          const chunkNumber = index + 1;
          const chunkFileForUpload = new File([chunk], `${file.name}-part-${chunkNumber}`, {
            type: file.type,
          });

          // 计算分片MD5 - 使用 getFileMd5
          let chunkSpecificMd5 = '';
          try {
            // Create a File object from the chunk Blob to pass to getFileMd5
            const chunkFileForMd5 = new File([chunk], `chunk_${chunkNumber}_md5`, {
              type: chunk.type,
            });
            const chunkMd5Result = await getFileMd5(chunkFileForMd5);
            chunkSpecificMd5 = chunkMd5Result.md5; // Assuming .md5 is the direct result for small files/chunks
            if (!chunkSpecificMd5) {
              // Handle cases where md5 might be in md5Promise for some reason, though unlikely for small chunks
              if (chunkMd5Result.md5Promise) {
                chunkSpecificMd5 = await chunkMd5Result.md5Promise;
              } else {
                throw new Error('Chunk MD5 calculation returned no direct md5 or md5Promise');
              }
            }
          } catch (md5Error) {
            console.error(
              `[Server上传] 分片 ${chunkNumber}/${totalChunks} MD5 计算失败:`,
              md5Error,
            );
            throw new Error(`分片 ${chunkNumber} MD5 计算失败`);
          }

          console.log(
            `[Server上传] 开始上传分片 ${chunkNumber}/${totalChunks}, 大小: ${(chunk.size / (1024 * 1024)).toFixed(2)}MB, MD5: ${chunkSpecificMd5}`,
          );

          try {
            await uploadFileService({
              key: fileKey, // Key for the entire file
              file: chunkFileForUpload, // The chunk itself as a File object for upload
              chunkIndex: index.toString(), // Changed from chunkNumber.toString() to index.toString()
              chunkTotal: totalChunks.toString(),
              chunkHash: chunkSpecificMd5, // MD5 of the current chunk
            });

            uploadedBytes += chunk.size;
            if (onProgress) {
              const progress = Math.floor((uploadedBytes / file.size) * 100);
              onProgress(progress);
            }
            console.log(`[Server上传] 分片 ${chunkNumber}/${totalChunks} 上传成功`);
          } catch (uploadError) {
            console.error(`[Server上传] 分片 ${chunkNumber}/${totalChunks} 上传失败:`, uploadError);
            throw uploadError; // Propagate error to stop Promise.all or handle retry
          }
        };

        const uploadTasks = chunks.map((chunk, index) => () => uploadChunk(chunk, index));

        // Simple concurrency limit
        const results = [];
        const executing = new Set();
        for (const task of uploadTasks) {
          const promise = task()
            .then((result) => {
              executing.delete(promise);
              return result;
            })
            .catch((err) => {
              executing.delete(promise);
              throw err;
            });
          executing.add(promise);
          results.push(promise);
          if (executing.size >= concurrentChunks) {
            await Promise.race(executing);
          }
        }
        await Promise.all(results);

        // 所有分片上传成功后
        if (onProgress) {
          onProgress(100); // Ensure 100% is reported
        }

        // 如果正在使用临时ID，等待真正的MD5计算完成
        if (usingOverallTempId && overallFileMd5Promise) {
          finalOverallMd5 = await overallFileMd5Promise;
          console.log(`[性能统计][Server] 完整文件MD5计算已完成: ${finalOverallMd5}`);
          const fileWithMd5 = file as File & { md5?: string };
          if (fileWithMd5.md5 !== finalOverallMd5) {
            fileWithMd5.md5 = finalOverallMd5;
          }
        }

        return {
          url: host + fileKey, // URL of the reassembled file
          success: true,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          md5: finalOverallMd5,
        };
      } else {
        // 原有的普通服务器上传逻辑
        console.log(
          `[Server上传] 使用服务器普通上传，文件大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        );

        try {
          const uploadParams: CommonType.UploadFileParams = {
            key: fileKey,
            file: file,
            // No chunk parameters for plain upload
          };

          /*const response =*/ await uploadFileService(uploadParams); // Use aliased service, response not used

          if (onProgress) {
            onProgress(100);
          }

          if (usingOverallTempId && overallFileMd5Promise) {
            finalOverallMd5 = await overallFileMd5Promise;
            console.log(`[性能统计][Server] 完整文件MD5计算已完成: ${finalOverallMd5}`);
            const fileWithMd5 = file as File & { md5?: string };
            if (fileWithMd5.md5 !== finalOverallMd5) {
              fileWithMd5.md5 = finalOverallMd5;
            }
          }

          // The 'uploadFileService' returns BaseResponse<void>, so success is implicit if no error
          // The 'response' variable here from `await uploadFileService` will be the BaseResponse<void>
          // We need to ensure our UploadResult format.
          // Assuming 'host + fileKey' is the accessible URL.
          return {
            url: host + fileKey,
            success: true, // Assumed success if no error from uploadFileService
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            md5: finalOverallMd5,
          };
        } catch (error: any) {
          // 普通上传的重试逻辑 (已存在于代码末尾的catch块中，会处理此处的抛出)
          console.error(`[Server上传][普通] 失败 (key: ${fileKey}):`, error);
          throw error; // Re-throw to be handled by the main retry logic of customUpload
        }
      }
    }

    default:
      throw new Error(`不支持的上传通道类型: ${channel}`);
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
