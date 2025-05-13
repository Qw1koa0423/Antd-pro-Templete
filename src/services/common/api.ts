/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2024-03-18 11:16:07
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-05-13 10:46:32
 * @FilePath: \Antd-pro-Templete\src\services\common\api.ts
 * @Description: 公共分类接口
 *
 * Copyright (c) 2024 by 遥在科技, All Rights Reserved.
 */
import { request } from '@umijs/max';
/**
 * @name 获取上传权限
 * @description 获取资源权限（上传）凭证
 */
export async function getAuth() {
  return request<API.BaseResponse<CommonType.AuthResponse>>(`${API_URL}/resource/auth`, {
    method: 'GET',
  });
}

/**
 * @name 获取省市区列表
 * @param params 查询参数
 * @param params.pid 父节点ID，默认0
 */
export async function getAreaList(params?: { pid?: string }) {
  return request<API.BaseResponse<CommonType.CommonListResponse>>(`${API_URL}/area/list`, {
    method: 'GET',
    params,
  });
}

/**
 * @name 上传文件
 * @description 本地文件上传（server方式），支持普通上传和分片上传
 * @param params 上传参数
 * @param params.key 文件名，必填
 * @param params.file 上传文件，必填
 * @param params.chunkIndex 块序号，分片上传时必填
 * @param params.chunkTotal 块总数，分片上传时必填
 * @param params.chunkHash 块标识，分片上传时必填
 */
export async function uploadFile(params: CommonType.UploadFileParams) {
  const formData = new FormData();

  // 添加分片上传相关参数（如果有）
  if (params.chunkIndex) formData.append('chunkIndex', params.chunkIndex);
  if (params.chunkTotal) formData.append('chunkTotal', params.chunkTotal);
  if (params.chunkHash) formData.append('chunkHash', params.chunkHash);
  // 添加所有参数到FormData
  formData.append('key', params.key);
  formData.append('file', params.file);

  return request<API.BaseResponse<void>>(`${API_URL}/upload`, {
    method: 'POST',
    data: formData,
  });
}

/**
 * @name 获取订单平台枚举
 * @description 获取订单平台的枚举值列表
 */
export async function getOrderPlatformEnum() {
  return request<API.BaseResponse<CommonType.CommonListResponse>>(
    `${API_URL}/enum/order/platform`,
    {
      method: 'GET',
    },
  );
}

/**
 * @name 获取订单渠道枚举
 * @description 获取订单渠道的枚举值列表
 */
export async function getOrderChannelEnum() {
  return request<API.BaseResponse<CommonType.CommonListResponse>>(`${API_URL}/enum/order/channel`, {
    method: 'GET',
  });
}
