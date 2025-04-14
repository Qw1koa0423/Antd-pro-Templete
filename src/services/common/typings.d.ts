/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2024-03-18 11:16:07
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 14:19:21
 * @FilePath: \Antd-pro-Templete\src\services\common\typings.d.ts
 * @Description: 公共分类类型定义
 *
 * Copyright (c) 2024 by 遥在科技, All Rights Reserved.
 */
declare namespace CommonType {
  /** 上传权限响应 */
  interface AuthResponse {
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

  /** 通用列表项 */
  interface CommonItem {
    id: number;
    name: string;
  }

  /** 通用列表响应 */
  interface CommonListResponse {
    list: CommonItem[];
  }

  /** 上传文件参数 */
  interface UploadFileParams {
    key: string;
    file: File;
  }

  /** 枚举项 */
  type EnumItem = CommonItem;

  /** 区域项 */
  type AreaItem = CommonItem;

  // 复用 CommonItem，无需额外定义
  // 如果将来有特殊需求，可以在这里添加特定字段
}
