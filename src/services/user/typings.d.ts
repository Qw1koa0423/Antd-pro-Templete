/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-26 13:28:48
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:44:34
 * @FilePath: \Templete\src\services\user\typings.d.ts
 * @Description: 用户管理相关类型
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
declare namespace UserType {
  /** 用户列表请求 */
  type UserListParams = {
    keyWords?: string;
    roleName?: 0 | 1;
    startTime?: string;
    endTime?: string;
  };
  /** 用户列表返回 */
  type UserListItem = {
    keyIndex?: number;
    id: number;
    username: string;
    avatar: string;
    account: string;
    createTime: string;
    updateTime: string;
    region: string[];
    status: 0 | 1;
    roleId: number;
  };
  /** 用户 */
  type User = {
    id: number;
    username: string;
    account: string;
    password: string;
    avatar: string;
    region: number[];
    role: number[];
    createTime: string;
    updateTime: string;
  };
}
