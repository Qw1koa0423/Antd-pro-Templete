/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 11:48:23
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 09:15:20
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
interface ConfigProps {
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
interface UploadResult {
  url: string;
}

/**
 * 上传认证信息的本地存储键
 */
const UPLOAD_DATA_KEY = 'uploadData';

/**
 * 自定义上传文件
 * @param file 需要上传的文件
 * @param config 上传配置
 * @returns 返回上传结果，包含文件URL
 */
const customUpload = async (file: File, config: ConfigProps): Promise<UploadResult> => {
  const { accessKeyId, accessKeySecret, securityToken, endPoint, bucket, path, host } = config;

  try {
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
    };

    const client = new baidubce.BosClient(bosConfig);

    // 获取并设置文件MIME类型
    const ext = url.split(/\./g).pop() || '';
    let mimeType = baidubce.MimeType.guess(ext);
    if (/^text\//.test(mimeType)) {
      mimeType += '; charset=UTF-8';
    }

    // 上传文件
    await client.putObjectFromBlob(bucket, url, file, {
      'Content-Type': mimeType,
    });

    return { url: host + url };
  } catch (error) {
    console.error('文件上传失败:', error);
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

    // 检查是否过期
    const isTokenExpired = !uploadData.expiredTime || uploadData.expiredTime * 1000 < Date.now();

    if (isTokenExpired) {
      // 获取新的认证信息
      const auth = await getAuth();
      localStorage.setItem(UPLOAD_DATA_KEY, JSON.stringify(auth));
      return auth;
    }

    return uploadData;
  } catch (error) {
    console.error('获取上传认证失败:', error);
    throw error;
  }
};

export { customUpload, isExpired };
