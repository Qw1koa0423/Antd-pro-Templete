/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:33:52
 * @FilePath: \Antd-pro-Templete\src\app.tsx
 * @Description: 项目入口
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import { errorConfig } from './requestErrorConfig';
import { getApiAuth } from './services/account/api';
import React from 'react';

// 登录路径常量
const loginPath = '/user/login';

/**
 * 获取应用初始状态
 * @see https://umijs.org/zh-CN/plugins/plugin-initial-state
 */
export async function getInitialState(): Promise<{
  settings: Partial<LayoutSettings>;
  currentUser?: AccountType.LoginResponse & { username: string };
  loading?: boolean;
  fetchUserInfo?: () => Promise<(AccountType.LoginResponse & { username: string }) | undefined>;
}> {
  const { location } = history;

  // 获取最新用户信息的函数
  const fetchUserInfo = async () => {
    try {
      // 从本地存储获取基本用户信息
      const storageInfo = window.__GLOBAL_DATA__?.getUserInfo?.() || null;

      if (!storageInfo) return undefined;

      // 获取最新的API权限列表
      try {
        const apiAuthRes = await getApiAuth();
        if (apiAuthRes.data && apiAuthRes.data.list) {
          // 合并最新的权限信息
          const updatedUserInfo = {
            ...storageInfo,
            apiPermissions: apiAuthRes.data.list,
          };

          // 更新本地存储
          window.localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          window.sessionStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

          return updatedUserInfo;
        }
      } catch (apiError) {
        console.error('刷新权限失败:', apiError);
        // 权限获取失败时使用原有权限
      }

      return storageInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return undefined;
    }
  };

  // 默认返回值
  const defaultState = {
    settings: defaultSettings as Partial<LayoutSettings>,
    fetchUserInfo,
  };

  // 如果在登录页，则只返回默认配置
  if (location.pathname === loginPath) {
    return defaultState;
  }

  // 尝试获取最新用户信息
  const userInfo = await fetchUserInfo();
  if (!userInfo) {
    history.push(loginPath);
    return defaultState;
  }

  // 返回带有用户信息的状态
  return {
    ...defaultState,
    currentUser: userInfo,
  };
}

/**
 * ProLayout 布局配置
 * @see https://procomponents.ant.design/components/layout
 */
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    // 头像配置
    avatarProps: {
      src: '/avatar.png',
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },

    // 水印配置
    waterMarkProps: initialState?.currentUser?.username
      ? {
          content: initialState.currentUser.username,
        }
      : undefined,

    // 页面切换时的权限验证
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录且不在登录页，则重定向到登录页
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },

    // 自定义403页面
    unAccessible: <>{React.createElement(require('./pages/403').default)}</>,

    // 布局背景图片配置
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],

    // 链接配置
    links: [],

    // 菜单头部渲染
    menuHeaderRender: undefined,

    // 子组件渲染
    childrenRender: (children) => {
      // 加载状态处理（暂时注释）
      // if (initialState?.loading) return <PageLoading />;
      return <>{children}</>;
    },

    // 合并初始状态中的设置
    ...initialState?.settings,
  };
};

/**
 * 请求配置
 * @see https://umijs.org/docs/max/request
 */
export const request = {
  ...errorConfig,
};

// 全局命名空间声明
declare global {
  interface Window {
    __GLOBAL_DATA__?: {
      getUserInfo?: () => any;
    };
  }
}

// 初始化全局函数
window.__GLOBAL_DATA__ = {
  // 从requestErrorConfig导入的getUserInfo函数
  getUserInfo: () => {
    const storage =
      window.sessionStorage.getItem('userInfo') || window.localStorage.getItem('userInfo');

    try {
      return storage ? JSON.parse(storage) : null;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  },
};
