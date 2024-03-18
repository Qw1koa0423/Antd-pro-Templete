/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 13:10:10
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-04-03 13:10:43
 * @FilePath: \Templete\src\utils\index.ts
 * @Description: 统一导出
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { getFileMd5, getFileWH, getVideoThumbImg } from './dealwithfile';
import getSignature from './signature';
import { customUpload, isExpired } from './upload';
export { getFileMd5, getFileWH, getVideoThumbImg, getSignature, customUpload, isExpired };
