/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-28 10:48:25
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 14:27:07
 * @FilePath: \Templete\src\services\option\api.ts
 * @Description: 数据相关接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { request } from '@umijs/max';

/** 获取权限列表 */
export const getPermissionList = () => {
  return request<{ list: Option.PermissionListItem[] }>(`${API_URL}/permission/list`, {
    method: 'GET',
  });
};

/** 获取操作日志 */
export const getOperationLogList = (params?: API.PageRequest & { keyWords: string }) => {
  return request<API.PageInfo<Option.OperationLogListItem>>(`${API_URL}/operation/log`, {
    method: 'GET',
    params,
  });
};
