/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-27 11:57:41
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 09:46:12
 * @FilePath: \Templete\src\services\role\api.ts
 * @Description: 角色管理接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { request } from 'umi';
/** 获取角色列表 */
export async function getRoleList(params?: API.PageRequest & Role.RoleListParams) {
  return request<API.PageInfo<Role.RoleListItem>>(`${API_URL}/role/list`, {
    method: 'GET',
    params,
  });
}

/** 获取角色详情 */
export async function getRoleDetail(id: number) {
  return request<Role.Role>(`${API_URL}/role/detail?id=${id}`, {
    method: 'GET',
  });
}

/** 添加角色 */
export async function addRole(
  body: Omit<Role.Role, 'permissionNames' | 'id' | 'createTime' | 'updateTime'>,
) {
  return request(`${API_URL}/role/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 删除角色 */
export async function deleteRole(body: { id: number }) {
  return request(`${API_URL}/role/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/** 修改角色 */
export async function updateRole(
  body: Omit<Role.Role, 'permissionNames' | 'createTime' | 'updateTime'>,
) {
  return request(`${API_URL}/role/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
