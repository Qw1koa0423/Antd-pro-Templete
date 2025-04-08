/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 09:36:32
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 13:28:12
 * @FilePath: \Antd-pro-Templete\src\services\login\typings.d.ts
 * @Description: 登录相关接口类型定义
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
// @ts-ignore
/* eslint-disable */

declare namespace UserType {
  /** 登录请求类型 */
  type LoginParams = {
    username: string;
    password: string;
  };
  /** 登录返回类型 */
  type LoginResponse = {
    token: string;
  };
  /** 重置密码请求类型 */
  type ResetPasswordParams = {
    oldPass: string;
    newPass: string;
    rePass: string;
  };
}
