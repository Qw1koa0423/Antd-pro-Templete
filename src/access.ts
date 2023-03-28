/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 17:13:34
 * @FilePath: \Templete\src\access.ts
 * @Description: 权限
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

export default function access(initialState: { currentUser: Account.LoginResult }) {
  const { currentUser } = initialState ?? {};

  return {
    normalRouteFilter: (routes: any) => {
      return currentUser?.permissions.some((item: string) => routes.api.includes(item));
    },
    normalFunction: (_api: string | string[]) => {
      if (typeof _api === 'string') {
        return currentUser?.permissions.includes(_api);
      }
      return currentUser?.permissions.some((item: string) => _api.includes(item));
    },
  };
}
