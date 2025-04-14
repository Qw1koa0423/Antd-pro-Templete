/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 09:36:32
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 14:28:48
 * @FilePath: \Antd-pro-Templete\src\services\account\typings.d.ts
 * @Description: 登录相关接口类型定义
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
// @ts-ignore
/* eslint-disable */

declare namespace AccountType {
  /** 登录请求类型 */
  type LoginParams = {
    username: string;
    password: string;
  };
  /** 登录返回类型 */
  type LoginResponse = {
    token: string;
    apiPermissions?: string[]; // API权限列表
  };
  /** 重置密码请求类型 */
  type ResetPasswordParams = {
    oldPass: string;
    newPass: string;
    rePass: string;
  };

  /** API权限响应类型 */
  type ApiAuthResponse = {
    list: string[];
  };
}
