/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-28 10:48:25
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 14:26:29
 * @FilePath: \Templete\src\services\permission\typings.d.ts
 * @Description: 权限相关类型
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

declare namespace Option {
  type PermissionListItem = {
    id: number;
    name: string;
    path: string;
    method: 'GET' | 'POST';
  };
  type OperationLogListItem = {
    keyIndex?: number;
    id: number;
    username: string;
    account: string;
    detail: string;
    createTime: string;
  };
}
