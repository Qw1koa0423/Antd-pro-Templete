/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2024-03-18 11:16:07
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-18 11:17:16
 * @FilePath: \Antd-pro-Templete\src\services\common\typings.d.ts
 * @Description:
 *
 * Copyright (c) 2024 by 遥在科技, All Rights Reserved.
 */
declare namespace CommonType {
  /** 上传权限 */
  interface AuthResponse {
    channel: string;
    host: string;
    path: string;
    bucket?: string;
    endPoint?: string;
    expiredTime: number;
    accessKeyId?: string;
    accessKeySecret?: string;
    securityToken?: string;
  }
}
