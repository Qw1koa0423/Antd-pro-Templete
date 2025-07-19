/*
 * @Author: Your Name your.email@example.com
 * @Date: 2024-01-01 00:00:00
 * @Description: 权限包装组件 - 根据配置自动切换权限控制模式
 */

import React from 'react';
import { Access, useAccess } from '@umijs/max';
import { shouldEnablePermission } from '@/config/permission';

export interface PermissionWrapperProps {
  /**
   * 权限标识
   * - 当启用权限时，检查用户是否拥有该权限
   * - 当禁用权限时，直接显示子组件
   */
  permission?: string;

  /**
   * 是否需要登录
   * - 当设置为true时，检查用户登录状态
   * - 优先级低于permission
   */
  requireLogin?: boolean;

  /**
   * 是否需要管理员权限
   * - 当设置为true时，检查管理员权限
   * - 优先级低于permission
   */
  requireAdmin?: boolean;

  /**
   * 无权限时的回退组件
   */
  fallback?: React.ReactNode;

  /**
   * 子组件
   */
  children: React.ReactNode;

  /**
   * 强制禁用权限检查（用于测试或特殊情况）
   */
  forceDisablePermission?: boolean;
}

/**
 * 权限包装组件
 *
 * 使用示例:
 * ```tsx
 * // 检查特定API权限
 * <PermissionWrapper permission="user:create">
 *   <Button>创建用户</Button>
 * </PermissionWrapper>
 *
 * // 检查登录状态
 * <PermissionWrapper requireLogin>
 *   <Button>需要登录</Button>
 * </PermissionWrapper>
 *
 * // 检查管理员权限
 * <PermissionWrapper requireAdmin>
 *   <Button>管理员功能</Button>
 * </PermissionWrapper>
 *
 * // 带回退组件
 * <PermissionWrapper
 *   permission="user:delete"
 *   fallback={<Button disabled>无权限</Button>}
 * >
 *   <Button danger>删除用户</Button>
 * </PermissionWrapper>
 * ```
 */
const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  permission,
  requireLogin,
  requireAdmin,
  fallback,
  children,
  forceDisablePermission = false,
}) => {
  const access = useAccess();

  // 如果强制禁用权限或系统未启用权限，直接渲染子组件
  if (forceDisablePermission || !shouldEnablePermission()) {
    return <>{children}</>;
  }

  // 确定权限检查逻辑
  let accessible = true;

  if (permission) {
    // 检查特定API权限
    accessible = access.canAccess(permission);
  } else if (requireAdmin) {
    // 检查管理员权限
    accessible = access.isAdmin;
  } else if (requireLogin) {
    // 检查登录状态
    accessible = access.isLogin;
  }

  return (
    <Access accessible={accessible} fallback={fallback}>
      {children}
    </Access>
  );
};

export default PermissionWrapper;

/**
 * 便捷的权限检查Hook
 */
export const usePermission = () => {
  const access = useAccess();
  const isPermissionEnabled = shouldEnablePermission();

  return {
    /**
     * 检查是否有权限
     */
    hasPermission: (permission: string) => {
      if (!isPermissionEnabled) return true;
      return access.canAccess(permission);
    },

    /**
     * 检查是否为管理员
     */
    isAdmin: () => {
      if (!isPermissionEnabled) return true;
      return access.isAdmin;
    },

    /**
     * 检查是否已登录
     */
    isLoggedIn: () => {
      if (!isPermissionEnabled) return true;
      return access.isLogin;
    },

    /**
     * 权限系统是否启用
     */
    isPermissionEnabled,

    /**
     * 原始的access对象
     */
    access,
  };
};
