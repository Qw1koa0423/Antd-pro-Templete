/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-26 13:28:48
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:58:20
 * @FilePath: \Templete\src\services\user\api.ts
 * @Description: 用户管理相关请求
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { request } from 'umi';
/**
 * @name 获取用户列表
 * @param params
 */
export async function getUserList(params: API.PageRequest & UserType.UserListParams) {
  return request<API.PageInfo<UserType.UserListItem>>(`${API_URL}/user/list`, {
    method: 'GET',
    params,
  });
}
/**
 * @name 获取用户详情
 * @param id
 */
export async function getUserDetail(id: number) {
  return request<
    UserType.User & { permissionNames: string[]; roleNames: string; regionNames: string[] }
  >(`${API_URL}/user/detail?id=${id}`, {
    method: 'GET',
  });
}

/**
 * @name 添加用户
 * @param body
 */
export async function addUser(body: Omit<UserType.User, 'id' | 'createTime' | 'updateTime'>) {
  return request(`${API_URL}/user/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
/**
 * @name 删除用户
 * @param body
 */
export async function deleteUser(body: { id: number }) {
  return request(`${API_URL}/user/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
/**
 * @name 修改用户
 * @param body
 */
export async function updateUser(
  body: Omit<UserType.User, 'account' | 'createTime' | 'updateTime'>,
) {
  return request(`${API_URL}/user/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
