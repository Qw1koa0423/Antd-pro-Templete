/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-27 11:57:41
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 10:30:05
 * @FilePath: \Templete\src\services\role\typings.d.ts
 * @Description: 角色相关类型
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
declare namespace Role {
  type RoleListParams = {
    name?: string;
    startTime?: string;
    endTime?: string;
  };
  type RoleListItem = {
    keyIndex?: number;
    id: number;
    name: string;
    createTime: string;
    updateTime: string;
  };
  type Role = {
    id: number;
    name: string;
    createTime: string;
    updateTime: string;
    permissions: number[];
    permissionNames: string[];
  };
}
