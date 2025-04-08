/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2024-03-18 11:16:07
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 14:03:04
 * @FilePath: \Antd-pro-Templete\src\services\common\api.ts
 * @Description: 公共分类接口
 *
 * Copyright (c) 2024 by 遥在科技, All Rights Reserved.
 */
import { request } from '@umijs/max';
/**
 * @name 获取上传权限
 */
export async function getAuth() {
  return request<API.BaseResponse<CommonType.AuthResponse>>(`${API_URL}/resource/auth`, {
    method: 'GET',
  });
}
/**
 * @name 获取Api权限
 */
export async function getApiAuth(options?: { [key: string]: any }) {
  return request<API.BaseResponse<{ list: string[] }>>(`${API_URL}/auth/api`, {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * @name 获取省市区列表
 * @param pid 父节点ID，默认0
 */
export async function getAreaList(params?: { pid?: string }) {
  return request<API.BaseResponse<CommonType.CommonListResponse>>(`${API_URL}/area/list`, {
    method: 'GET',
    params,
  });
}
