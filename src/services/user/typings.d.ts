/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 09:36:32
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-22 11:58:21
 * @FilePath: \Templete\src\services\user\typings.d.ts
 * @Description: 登录相关接口类型定义
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
// @ts-ignore
/* eslint-disable */

declare namespace User {
  /** 登录请求类型 */
  type LoginParams = {
    account: string;
    password: string;
  };
}
