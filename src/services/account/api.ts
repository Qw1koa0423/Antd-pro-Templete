/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 10:26:40
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 14:24:48
 * @FilePath: \Antd-pro-Templete\src\services\account\api.ts
 * @Description: 账号相关接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { request } from '@umijs/max';

/**
 * @name 登录
 * @param body 登录参数
 */
export async function login(body: AccountType.LoginParams) {
  return request<API.BaseResponse<AccountType.LoginResponse>>(`${API_URL}/account/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/**
 * @name 重置密码
 * @param body 密码重置参数
 */
export async function resetPassword(body: AccountType.ResetPasswordParams) {
  return request<API.BaseResponse<void>>(`${API_URL}/account/rePass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/**
 * @name 获取API权限
 * @description 获取当前用户的API权限列表
 */
export async function getApiAuth(options?: { [key: string]: any }) {
  return request<API.BaseResponse<AccountType.ApiAuthResponse>>(`${API_URL}/auth/api`, {
    method: 'GET',
    ...(options || {}),
  });
}
