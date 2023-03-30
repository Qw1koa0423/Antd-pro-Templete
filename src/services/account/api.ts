/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-20 10:26:40
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-27 15:00:21
 * @FilePath: \Templete\src\services\account\api.ts
 * @Description: 账号相关接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { request } from 'umi';

/**
 * @name 登录
 * @param body
 */
export async function login(body: AccountType.LoginParams) {
  return request<AccountType.LoginResult>(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
/**
 * @name 退出登录
 */
export async function loginout() {
  return request(`${API_URL}/logout`, {
    method: 'POST',
  });
}
/**
 * @name 获取上传参数
 */
export async function getUploadParams() {
  return request<AccountType.UploadParams>(`${API_URL}/upload/params`, {
    method: 'GET',
  });
}
