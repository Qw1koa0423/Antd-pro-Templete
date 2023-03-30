/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 09:36:32
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:44:14
 * @FilePath: \Templete\src\services\account\typings.d.ts
 * @Description: 登录相关接口类型定义
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

declare namespace AccountType {
  /** 登录请求类型 */
  type LoginParams = {
    account: string;
    password: string;
  };
  type LoginResult = {
    username: string;
    account: string;
    avatar: string;
    role: number[];
    permissions: string[];
    token: string;
    expiredAt: number;
  };
  type UploadParams = {
    channel: string;
    host: string;
    path: string;
    bucket?: string;
    endPoint?: string;
    expiredTime: number;
    accessKeyId?: string;
    accessKeySecret?: string;
    securityToken?: string;
  };
}
