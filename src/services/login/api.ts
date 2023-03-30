/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 10:26:40
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 14:07:35
 * @FilePath: \Templete\src\services\login\api.ts
 * @Description: 用户相关接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { request } from 'umi';

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
