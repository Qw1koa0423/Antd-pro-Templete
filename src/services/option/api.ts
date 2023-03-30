/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-28 10:48:25
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:54:29
 * @FilePath: \Templete\src\services\option\api.ts
 * @Description: 数据相关接口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { request } from '@umijs/max';

/**
 * @name 获取权限列表
 */
export const getPermissionList = () => {
  return request<{ list: OptionType.PermissionListItem[] }>(`${API_URL}/permission/list`, {
    method: 'GET',
  });
};

/**
 * @name 获取操作日志
 * @param params
 */
export const getOperationLogList = (params?: API.PageRequest & { keyWords: string }) => {
  return request<API.PageInfo<OptionType.OperationLogListItem>>(`${API_URL}/operation/log`, {
    method: 'GET',
    params,
  });
};
