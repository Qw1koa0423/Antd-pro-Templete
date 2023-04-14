/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 11:48:23
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-04-14 11:16:39
 * @FilePath: \Templete\src\utils\upload.ts
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
import type { RcFile } from 'antd/lib/upload';
import { getFileMd5 } from './dealwithfile';

const customUpload = async (
  file: RcFile & { url?: string; md5?: string; width?: number; height?: number },
  config: ConfigProps,
) => {
  const { accessKeyId, accessKeySecret, securityToken, endPoint, bucket, path } = config;
  await getFileMd5(file);
  const suffix = file.name.slice(file.name.lastIndexOf('.'));
  file.url = path + file.md5 + suffix;
  const bosConfig = {
    credentials: {
      ak: accessKeyId,
      sk: accessKeySecret,
    },
    sessionToken: securityToken,
    endpoint: endPoint,
  };
  let client = new baidubce.BosClient(bosConfig);
  const ext = file.url.split(/\./g).pop();
  let mimeType = baidubce.MimeType.guess(ext);
  if (/^text\//.test(mimeType)) {
    mimeType += '; charset=UTF-8';
  }
  let options = {
    'Content-Type': mimeType,
  };
  client
    .putObjectFromBlob(bucket, file.url, file, options)
    .then(() => {
      console.log('上传截图成功');

      return true;
    })
    .catch(() => {
      console.log('上传截图成功');
      return false;
    });

  return file;
};
export default customUpload;
