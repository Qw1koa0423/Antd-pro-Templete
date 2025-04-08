/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 11:48:23
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 09:35:19
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
 * 获取上传认证信息
 * @returns 认证信息
 */
export const getUploadAuth = async (): Promise<CommonType.AuthResponse> => {
  try {
    const auth = await getAuth();
    localStorage.setItem(UPLOAD_DATA_KEY, JSON.stringify(auth));
    return auth;
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
    const expireTime = (uploadData.expiredTime || 0) * 1000;
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
 * 自定义上传文件，支持自动重试
 * @param file 需要上传的文件
 * @param config 上传配置
 * @param retryCount 当前重试次数
 * @returns 返回上传结果，包含文件URL
 */
const customUpload = async (
  file: File,
  config: ConfigProps,
  retryCount = 0,
): Promise<UploadResult> => {
  try {
    const { accessKeyId, accessKeySecret, securityToken, endPoint, bucket, path, host } = config;

    // 获取文件MD5
    const { md5 } = await getFileMd5(file);

    // 构建文件路径
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    const url = path + md5 + suffix;

    // 配置百度云存储客户端
    const bosConfig = {
      credentials: {
        ak: accessKeyId,
        sk: accessKeySecret,
      },
      sessionToken: securityToken,
      endpoint: endPoint,
      connectionTimeoutInMillis: 60000, // 连接超时时间增加到60秒
      receiveTimeoutInMillis: 60000, // 接收超时时间增加到60秒
    };

    const client = new baidubce.BosClient(bosConfig);

    // 获取并设置文件MIME类型
    const ext = url.split(/\./g).pop() || '';
    let mimeType = baidubce.MimeType.guess(ext);
    if (/^text\//.test(mimeType)) {
      mimeType += '; charset=UTF-8';
    }

    // 设置上传选项
    const options = {
      'Content-Type': mimeType,
      'Cache-Control': 'max-age=31536000', // 缓存一年
    };

    // 上传文件
    await client.putObjectFromBlob(bucket, url, file, options);

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
    console.error(`文件上传失败 (尝试 ${retryCount + 1}/${MAX_RETRY_COUNT + 1}):`, error);

    // 自动重试逻辑
    if (retryCount < MAX_RETRY_COUNT) {
      // 指数退避策略，避免立即重试
      const delayTime = Math.pow(2, retryCount) * 1000;

      console.log(`将在 ${delayTime}ms 后重试上传...`);
      await delay(delayTime);

      // 如果是认证问题，刷新认证
      try {
        const freshConfig = await isExpired();
        // 合并配置，确保使用最新的认证信息
        const updatedConfig = { ...config, ...freshConfig };

        // 重试上传
        return await customUpload(file, updatedConfig, retryCount + 1);
      } catch (refreshError) {
        console.error('刷新认证失败，继续使用原配置重试:', refreshError);
        return await customUpload(file, config, retryCount + 1);
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
 * @returns 上传结果列表
 */
const batchUpload = async (
  files: File[],
  config: ConfigProps,
  onProgress?: (current: number, total: number) => void,
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    try {
      const result = await customUpload(files[i], config);
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
