/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 11:48:23
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-18 16:57:16
 * @FilePath: \Antd-pro-Templete\src\utils\upload.ts
 * @Description: web直接上传
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
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
import baidubce from '@baiducloud/sdk';
import { getFileMd5 } from './dealwithfile';
import { getAuth } from '@/services/common/api';
const customUpload = async (file: File, config: ConfigProps): Promise<{ url: string }> => {
  const { accessKeyId, accessKeySecret, securityToken, endPoint, bucket, path, host } = config;
  const { md5 } = await getFileMd5(file);
  const suffix = file.name.slice(file.name.lastIndexOf('.'));
  const url = path + md5 + suffix;
  const bosConfig = {
    credentials: {
      ak: accessKeyId,
      sk: accessKeySecret,
    },
    sessionToken: securityToken,
    endpoint: endPoint,
  };
  const client = new baidubce.BosClient(bosConfig);
  const ext = url.split(/\./g).pop();
  let mimeType = baidubce.MimeType.guess(ext);
  if (/^text\//.test(mimeType)) {
    mimeType += '; charset=UTF-8';
  }
  const options = {
    'Content-Type': mimeType,
  };
  return new Promise((resolve, reject) => {
    client
      .putObjectFromBlob(bucket, url, file, options)
      .then(() => {
        resolve({
          url: host + url,
        });
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};
const isExpired = async (): Promise<CommonType.AuthResponse> => {
  const stroge = window.localStorage.getItem('uploadData') || '{}';
  const uploadData: CommonType.AuthResponse = JSON.parse(stroge);
  if (!uploadData.expiredTime || uploadData.expiredTime * 1000 < Date.now()) {
    const auth = await getAuth();
    window.localStorage.setItem('uploadData', JSON.stringify(auth));
    return auth;
  } else {
    return uploadData;
  }
};
export { customUpload, isExpired };
