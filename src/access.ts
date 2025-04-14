/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:30:00
 * @FilePath: \Antd-pro-Templete\src\access.ts
 * @Description: 权限
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

/**
 * @name 权限定义
 * @description 返回一个权限对象，其中包含了各种权限控制函数
 * @return {Object} 权限对象
 */
export default function access(initialState: {
  currentUser?: AccountType.LoginResponse & { username: string };
}) {
  const { currentUser } = initialState || {};
  // 获取用户的API权限列表（假设后端返回的结构中包含apiPermissions字段）
  const apiPermissions = currentUser?.apiPermissions || [];

  // 判断是否拥有所有权限(*表示拥有所有权限)
  const hasAllPermissions = apiPermissions.includes('*');

  // 判断是否有管理员权限（这里可以根据API权限列表中的特定权限来判断）
  const hasAdminPermission =
    hasAllPermissions ||
    apiPermissions.some((permission) => permission.includes('admin:') || permission === 'admin');

  return {
    // 是否登录
    isLogin: !!currentUser,

    // 管理员权限 - 通过API权限列表判断
    isAdmin: hasAdminPermission,

    // 路由访问权限，接收路由信息作为参数
    routeFilter: (route: any) => {
      // 如果路由没有定义access属性，则默认可访问
      if (!route.access) return true;

      // 如果用户拥有所有权限(*)，则可以访问所有路由
      if (hasAllPermissions) return true;

      // 判断是否具有管理员权限的路由
      if (route.access === 'isAdmin' && !hasAdminPermission) {
        return false;
      }

      // 如果是需要登录的路由，检查是否已登录
      if (route.access === 'isLogin' && !currentUser) {
        return false;
      }

      // 如果路由指定了所需的API权限
      if (route.accessApi && typeof route.accessApi === 'string') {
        return apiPermissions.includes(route.accessApi);
      }

      return true;
    },

    // API权限检查 - 直接基于API权限列表判断
    canAccess: (apiKey: string) => {
      // 如果没有登录，则没有权限
      if (!currentUser) return false;

      // 如果用户拥有所有权限(*)，则可以访问所有API
      if (hasAllPermissions) return true;

      // 管理员权限判断（基于API权限列表）
      if (hasAdminPermission) return true;

      // 直接检查用户是否拥有特定API权限
      return apiPermissions.includes(apiKey);
    },
  };
}
