/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2024-03-18 11:16:07
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-18 11:17:58
 * @FilePath: \Antd-pro-Templete\src\services\common\api.ts
 * @Description:
 *
 * Copyright (c) 2024 by 遥在科技, All Rights Reserved.
 */
import { request } from '@umijs/max';
/**
 * @name 获取上传权限
 */
export async function getAuth() {
  return request<CommonType.AuthResponse>(`${API_URL}/resource/auth`, {
    method: 'GET',
  });
}
/**
 * @name 获取Api权限
 */
export async function getApiAuth(options?: { [key: string]: any }) {
  return request<{ list: string[] }>(`${API_URL}/auth/api`, {
    method: 'GET',
    ...(options || {}),
  });
}
