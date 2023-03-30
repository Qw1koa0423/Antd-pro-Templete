/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-27 11:57:41
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:55:32
 * @FilePath: \Templete\src\services\role\api.ts
 * @Description: 角色管理接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { request } from 'umi';
/**
 * @name 获取角色列表
 * @param params
 */
export async function getRoleList(params?: API.PageRequest & RoleType.RoleListParams) {
  return request<API.PageInfo<RoleType.RoleListItem>>(`${API_URL}/role/list`, {
    method: 'GET',
    params,
  });
}

/**
 * @name 获取角色详情
 * @param id
 */
export async function getRoleDetail(id: number) {
  return request<RoleType.Role>(`${API_URL}/role/detail?id=${id}`, {
    method: 'GET',
  });
}

/**
 * @name添加角色
 * @param body
 */
export async function addRole(
  body: Omit<RoleType.Role, 'permissionNames' | 'id' | 'createTime' | 'updateTime'>,
) {
  return request(`${API_URL}/role/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/**
 * @name 删除角色
 * @param body
 */
export async function deleteRole(body: { id: number }) {
  return request(`${API_URL}/role/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/**
 * @name 修改角色
 * @param body
 */
export async function updateRole(
  body: Omit<RoleType.Role, 'permissionNames' | 'createTime' | 'updateTime'>,
) {
  return request(`${API_URL}/role/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
