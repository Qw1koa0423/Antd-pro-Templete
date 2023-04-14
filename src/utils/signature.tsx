/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-31 11:14:46
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-31 15:38:37
 * @FilePath: \Templete\src\utils\signature.tsx
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import Base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import HmacSHA256 from 'crypto-js/hmac-sha256';
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

const ossSignature = (config: ConfigProps) => {
  // todo oss
  console.log(config);

  return {};
};
const bosSignature = (config: ConfigProps) => {
  const policyText = {};
  const policy = Base64.stringify(Utf8.parse(JSON.stringify(policyText)));
  const signature = Hex.stringify(HmacSHA256(policy, config.accessKeySecret || ''));
  return {
    policy: policy,
    accessKey: config.accessKeyId,
    signature: signature,
    'x-bce-security-token': config.securityToken,
  };
};
const cosSignature = (config: ConfigProps) => {
  //@ts-ignore
  const signature = CosAuth({
    SecretId: config.accessKeyId,
    SecretKey: config.accessKeySecret,
    Method: 'POST',
    Pathname: '/',
  });
  return {
    Signature: signature,
    'x-cos-security-token': config.securityToken,
  };
};

const serverSignature = (config: ConfigProps) => {
  console.log(config);

  // todo server
  return {};
};

const getSignature = (config: ConfigProps) => {
  switch (config.channel) {
    case 'oss':
      return ossSignature(config);
    case 'cos':
      return cosSignature(config);
    case 'bos':
      return bosSignature(config);
    case 'server':
      return serverSignature(config);
    default:
      return {};
  }
};

export default getSignature;
