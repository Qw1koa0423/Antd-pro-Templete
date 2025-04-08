/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 13:10:10
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 10:25:10
 * @FilePath: \Templete\src\utils\index.ts
 * @Description: 统一导出
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { getFileMd5, getFileWH, getVideoThumbImg } from './dealwithfile';
import getSignature from './signature';
import { batchUpload, customUpload, isExpired } from './upload';
export {
  getFileMd5,
  getFileWH,
  getVideoThumbImg,
  getSignature,
  customUpload,
  batchUpload,
  isExpired,
};
