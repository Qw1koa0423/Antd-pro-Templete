/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 10:26:40
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 10:31:00
 * @FilePath: \Antd-pro-Templete\src\services\login\api.ts
 * @Description: 用户相关接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { request } from '@umijs/max';

/**
 * @name 登录
 * @param body
 */
export async function login(body: UserType.LoginParams) {
  return request<UserType.LoginResponse>(`${API_URL}/account/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
/**
 * @name 重置密码
 * @param body
 */
export async function resetPassword(body: UserType.ResetPasswordParams) {
  return request(`${API_URL}/account/rePass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
