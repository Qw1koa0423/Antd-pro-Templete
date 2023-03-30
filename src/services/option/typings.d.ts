/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 15:31:47
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:52:41
 * @FilePath: \Templete\src\services\option\typings.d.ts
 * @Description: 数据相关接口类型定义
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

declare namespace OptionType {
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
