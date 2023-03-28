/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-26 13:28:48
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 14:37:33
 * @FilePath: \Templete\src\services\user\api.ts
 * @Description: 用户管理相关请求
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { request } from 'umi';
/** 获取用户列表 */
export async function getUserList(params: API.PageRequest & User.UserListParams) {
  return request<API.PageInfo<User.UserListItem>>(`${API_URL}/user/list`, {
    method: 'GET',
    params,
  });
}
/** 获取用户详情 */
export async function getUserDetail(id: number) {
  return request<
    User.User & { permissionNames: string[]; roleNames: string; regionNames: string[] }
  >(`${API_URL}/user/detail?id=${id}`, {
    method: 'GET',
  });
}

/** 添加用户 */
export async function addUser(body: Omit<User.User, 'id' | 'createTime' | 'updateTime'>) {
  return request(`${API_URL}/user/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
/** 删除用户 */
export async function deleteUser(body: { id: number }) {
  return request(`${API_URL}/user/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
/** 修改用户 */
export async function updateUser(body: Omit<User.User, 'account' | 'createTime' | 'updateTime'>) {
  return request(`${API_URL}/user/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}
