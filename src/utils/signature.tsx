/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-31 11:14:46
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 14:17:39
 * @FilePath: \Antd-pro-Templete\src\utils\signature.tsx
 * @Description: 云存储签名生成工具
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { ConfigProps } from './upload';
import Base64 from 'crypto-js/enc-base64';
import Hex from 'crypto-js/enc-hex';
import Utf8 from 'crypto-js/enc-utf8';
import HmacSHA256 from 'crypto-js/hmac-sha256';

/**
 * OSS签名返回类型
 */
interface OssSignature {
  OSSAccessKeyId?: string;
  policy?: string;
  signature?: string;
  success_action_status?: string;
  'x-oss-security-token'?: string;
  [key: string]: string | undefined;
}

/**
 * BOS签名返回类型
 */
interface BosSignature {
  policy?: string;
  accessKey?: string;
  signature?: string;
  'x-bce-security-token'?: string;
  [key: string]: string | undefined;
}

/**
 * COS签名返回类型
 */
interface CosSignature {
  Signature?: string;
  'x-cos-security-token'?: string;
  [key: string]: string | undefined;
}

/**
 * Server签名返回类型
 */
interface ServerSignature {
  token?: string;
  [key: string]: string | undefined;
}

/**
 * 签名返回类型联合
 */
type SignatureResult = OssSignature | BosSignature | CosSignature | ServerSignature;

/**
 * 阿里云OSS签名生成
 * @param config 配置信息
 * @returns 签名和授权信息
 */
const ossSignature = (config: ConfigProps): OssSignature => {
  try {
    if (!config.accessKeyId || !config.accessKeySecret) {
      console.error('OSS签名失败: 缺少必要的AccessKey信息');
      return {};
    }

    // OSS策略定义
    const expiration = new Date(Date.now() + 900000); // 15分钟后过期
    const policyText = {
      expiration: expiration.toISOString(),
      conditions: [
        ['content-length-range', 0, 1073741824], // 最大1GB
      ],
    };

    // 将策略转为Base64编码
    const policy = Base64.stringify(Utf8.parse(JSON.stringify(policyText)));

    // 生成签名
    const signature = Base64.stringify(HmacSHA256(policy, config.accessKeySecret));

    return {
      OSSAccessKeyId: config.accessKeyId,
      policy,
      signature,
      success_action_status: '200',
      'x-oss-security-token': config.securityToken,
    };
  } catch (error) {
    console.error('OSS签名生成失败:', error);
    return {};
  }
};

/**
 * 百度云BOS签名生成
 * @param config 配置信息
 * @returns 签名和授权信息
 */
const bosSignature = (config: ConfigProps): BosSignature => {
  try {
    if (!config.accessKeyId || !config.accessKeySecret) {
      console.error('BOS签名失败: 缺少必要的AccessKey信息');
      return {};
    }

    // BOS策略定义
    const expirationDate = new Date(Date.now() + 900000);
    const formattedDate = expirationDate.toISOString().replace(/\.\d+Z$/, 'Z');

    const policyText = {
      expiration: formattedDate,
      conditions: [
        { bucket: config.bucket },
        ['content-length-range', 0, 1073741824], // 最大1GB
      ],
    };

    // 生成策略和签名
    const policy = Base64.stringify(Utf8.parse(JSON.stringify(policyText)));
    const signature = Hex.stringify(HmacSHA256(policy, config.accessKeySecret));

    return {
      policy,
      accessKey: config.accessKeyId,
      signature,
      'x-bce-security-token': config.securityToken,
    };
  } catch (error) {
    console.error('BOS签名生成失败:', error);
    return {};
  }
};

/**
 * 腾讯云COS签名生成
 * @param config 配置信息
 * @returns 签名和授权信息
 */
const cosSignature = (config: ConfigProps): CosSignature => {
  try {
    if (!config.accessKeyId || !config.accessKeySecret) {
      console.error('COS签名失败: 缺少必要的AccessKey信息');
      return {};
    }

    // 调用COS Auth方法生成签名（注：CosAuth方法需要引入腾讯云SDK）
    // @ts-ignore - CosAuth是全局函数，可能由外部脚本提供
    const signature = CosAuth?.({
      SecretId: config.accessKeyId,
      SecretKey: config.accessKeySecret,
      Method: 'POST',
      Pathname: '/',
    });

    if (!signature) {
      console.error('COS签名失败: 签名生成为空');
      return {};
    }

    return {
      Signature: signature,
      'x-cos-security-token': config.securityToken,
    };
  } catch (error) {
    console.error('COS签名生成失败:', error);
    return {};
  }
};

/**
 * 服务器端签名生成
 * @param config 配置信息
 * @returns 签名和授权信息
 */
const serverSignature = (config: ConfigProps): ServerSignature => {
  try {
    // 服务器端上传模式通常不需要客户端签名
    // 这里可以添加自定义的token或其他授权信息
    const timestamp = Date.now().toString();
    const signature = HmacSHA256(timestamp, config.accessKeySecret || '').toString();

    return {
      token: config.securityToken || signature,
      timestamp,
    };
  } catch (error) {
    console.error('服务器签名生成失败:', error);
    return {};
  }
};

/**
 * 生成上传签名
 * @param config 上传配置
 * @returns 对应云服务商的签名信息
 */
const getSignature = (config: ConfigProps): SignatureResult => {
  if (!config) {
    console.error('签名生成失败: 配置信息为空');
    return {};
  }

  try {
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
        console.error(`签名生成失败: 不支持的渠道 "${config.channel}"`);
        return {};
    }
  } catch (error) {
    console.error('签名生成过程发生错误:', error);
    return {};
  }
};

export default getSignature;
