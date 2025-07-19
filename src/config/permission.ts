/*
 * @Author: Your Name your.email@example.com
 * @Date: 2024-01-01 00:00:00
 * @Description: 权限系统配置
 */

/**
 * 权限系统配置
 */
export const PERMISSION_CONFIG = {
  /**
   * 是否启用权限系统
   * true: 启用完整的权限控制功能
   * false: 禁用权限控制，所有用户拥有全部权限
   */
  ENABLE_PERMISSION: true,

  /**
   * 权限模式
   * 'api': 基于API权限列表的权限控制
   * 'role': 基于角色的权限控制
   * 'simple': 简单的登录权限控制
   */
  PERMISSION_MODE: 'api' as 'api' | 'role' | 'simple',

  /**
   * 默认权限配置（当禁用权限系统时使用）
   */
  DEFAULT_PERMISSIONS: {
    isLogin: true,
    isAdmin: true,
    canAccess: () => true,
    apiPermission: () => true,
    routeFilter: () => true,
  },

  /**
   * 是否在开发环境下强制启用权限
   * true: 开发环境也进行权限检查
   * false: 开发环境跳过权限检查
   */
  FORCE_PERMISSION_IN_DEV: false,

  /**
   * 权限检查的白名单路由（无需权限即可访问）
   */
  PERMISSION_WHITELIST: ['/user/login', '/home', '/', '/403', '/404'],

  /**
   * 管理员权限标识
   * 当使用API权限模式时，包含这些权限的用户被视为管理员
   */
  ADMIN_PERMISSIONS: ['*', 'admin', 'admin:all'],

  /**
   * 角色权限映射（当使用role模式时）
   */
  ROLE_PERMISSIONS: {
    admin: ['*'],
    user: ['user:read', 'user:list'],
    guest: ['home:read'],
  },
};

/**
 * 获取当前环境是否应该启用权限
 */
export function shouldEnablePermission(): boolean {
  // 如果配置为不启用权限，直接返回false
  if (!PERMISSION_CONFIG.ENABLE_PERMISSION) {
    return false;
  }

  // 检查是否在开发环境
  const isDev = process.env.NODE_ENV === 'development';

  // 如果在开发环境且没有强制启用权限，返回false
  if (isDev && !PERMISSION_CONFIG.FORCE_PERMISSION_IN_DEV) {
    return false;
  }

  return true;
}

/**
 * 检查路由是否在权限白名单中
 */
export function isRouteInWhitelist(pathname: string): boolean {
  return PERMISSION_CONFIG.PERMISSION_WHITELIST.some(
    (route) => pathname === route || pathname.startsWith(route),
  );
}

/**
 * 快速切换权限模式的预设配置
 */
export const PERMISSION_PRESETS = {
  // 完整权限控制模式
  FULL_PERMISSION: {
    ENABLE_PERMISSION: true,
    PERMISSION_MODE: 'api' as const,
    FORCE_PERMISSION_IN_DEV: true,
  },

  // 简单权限模式（只检查登录状态）
  SIMPLE_PERMISSION: {
    ENABLE_PERMISSION: true,
    PERMISSION_MODE: 'simple' as const,
    FORCE_PERMISSION_IN_DEV: false,
  },

  // 无权限模式
  NO_PERMISSION: {
    ENABLE_PERMISSION: false,
    PERMISSION_MODE: 'api' as const,
    FORCE_PERMISSION_IN_DEV: false,
  },

  // 开发模式（开发时禁用权限，生产启用）
  DEVELOPMENT_MODE: {
    ENABLE_PERMISSION: true,
    PERMISSION_MODE: 'api' as const,
    FORCE_PERMISSION_IN_DEV: false,
  },
};

/**
 * 应用预设配置
 * @param preset 预设配置名称
 */
export function applyPermissionPreset(preset: keyof typeof PERMISSION_PRESETS) {
  const config = PERMISSION_PRESETS[preset];
  Object.assign(PERMISSION_CONFIG, config);
}
