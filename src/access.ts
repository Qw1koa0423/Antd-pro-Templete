/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:38:10
 * @FilePath: \Antd-pro-Templete\src\access.ts
 * @Description: 权限
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { PERMISSION_CONFIG, shouldEnablePermission, isRouteInWhitelist } from './config/permission';

/**
 * @name 权限定义
 * @description 返回一个权限对象，其中包含了各种权限控制函数
 * @return {Object} 权限对象
 */
export default function access(initialState: {
  currentUser?: AccountType.LoginResponse & { username: string };
}) {
  const { currentUser } = initialState || {};

  // 检查是否启用权限系统
  if (!shouldEnablePermission()) {
    console.log('🔓 权限系统已禁用，所有用户拥有完整权限');
    return {
      ...PERMISSION_CONFIG.DEFAULT_PERMISSIONS,
      isLogin: !!currentUser, // 保持登录状态检查
    };
  }
  // 根据权限模式获取权限信息
  let apiPermissions: string[] = [];
  let hasAllPermissions = false;
  let hasAdminPermission = false;

  if (PERMISSION_CONFIG.PERMISSION_MODE === 'api') {
    // API权限模式
    apiPermissions = currentUser?.apiPermissions || [];
    hasAllPermissions = apiPermissions.some((permission) =>
      PERMISSION_CONFIG.ADMIN_PERMISSIONS.includes(permission),
    );
    hasAdminPermission =
      hasAllPermissions ||
      apiPermissions.some((permission) =>
        PERMISSION_CONFIG.ADMIN_PERMISSIONS.some(
          (adminPerm) => permission.includes(adminPerm) || permission === adminPerm,
        ),
      );
  } else if (PERMISSION_CONFIG.PERMISSION_MODE === 'role') {
    // 角色权限模式
    const userRole = (currentUser?.role ||
      'guest') as keyof typeof PERMISSION_CONFIG.ROLE_PERMISSIONS;
    apiPermissions = PERMISSION_CONFIG.ROLE_PERMISSIONS[userRole] || [];
    hasAllPermissions = apiPermissions.includes('*');
    hasAdminPermission = userRole === 'admin' || hasAllPermissions;
  } else if (PERMISSION_CONFIG.PERMISSION_MODE === 'simple') {
    // 简单模式：只检查登录状态
    hasAllPermissions = !!currentUser;
    hasAdminPermission = !!currentUser;
    apiPermissions = currentUser ? ['*'] : [];
  }

  return {
    // 是否登录
    isLogin: !!currentUser,

    // 管理员权限 - 通过API权限列表判断
    isAdmin: hasAdminPermission,

    // API权限检查函数 - 用于路由的access属性
    apiPermission: (route: any) => {
      // 检查是否在白名单中
      if (route?.path && isRouteInWhitelist(route.path)) {
        return true;
      }

      // 如果用户拥有所有权限(*)，直接返回true
      if (hasAllPermissions) return true;

      // 获取路由中定义的API权限
      const requiredPermission = route?.accessApi;
      if (!requiredPermission) return true; // 如果未指定权限，则允许访问

      // 检查用户是否拥有指定的API权限
      return apiPermissions.includes(requiredPermission);
    },

    // 路由访问权限，接收路由信息作为参数
    routeFilter: (route: any) => {
      // 检查是否在白名单中
      if (route?.path && isRouteInWhitelist(route.path)) {
        return true;
      }

      // 如果用户拥有所有权限(*)，则可以访问所有路由
      if (hasAllPermissions) return true;

      // 先检查路由是否指定了所需的API权限
      if (route.accessApi && typeof route.accessApi === 'string') {
        // 如果指定了API权限，则必须拥有该权限才能访问
        if (!apiPermissions.includes(route.accessApi)) {
          return false;
        }
      }

      // 再检查是否有access属性的权限控制
      if (route.access) {
        // 判断是否具有管理员权限的路由
        if (route.access === 'isAdmin' && !hasAdminPermission) {
          return false;
        }

        // 如果是需要登录的路由，检查是否已登录
        if (route.access === 'isLogin' && !currentUser) {
          return false;
        }
      }

      return true;
    },

    // API权限检查 - 直接基于API权限列表判断
    canAccess: (apiKey: string) => {
      // 如果没有登录，则没有权限（除了简单模式）
      if (!currentUser && PERMISSION_CONFIG.PERMISSION_MODE !== 'simple') {
        return false;
      }

      // 如果用户拥有所有权限(*)，则可以访问所有API
      if (hasAllPermissions) return true;

      // 管理员权限判断（基于API权限列表）
      if (hasAdminPermission) return true;

      // 直接检查用户是否拥有特定API权限
      return apiPermissions.includes(apiKey);
    },
  };
}
