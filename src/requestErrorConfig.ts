/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 13:34:22
 * @FilePath: \Antd-pro-Templete\src\requestErrorConfig.ts
 * @Description: request错误处理
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import type { AxiosRequestConfig, RequestConfig, AxiosResponse } from '@umijs/max';
import { history } from '@umijs/max';
import { message } from 'antd';

// API响应数据结构定义
interface ResponseStructure {
  code: number;
  msg: string;
  data: any;
  success?: boolean;
  errorMessage?: string;
}

// 用户信息接口
interface UserInfo {
  token: string;
  [key: string]: any;
}

// 从存储中获取用户信息
const getUserInfo = (): UserInfo | null => {
  const storage =
    window.sessionStorage.getItem('userInfo') || window.localStorage.getItem('userInfo');

  try {
    return storage ? JSON.parse(storage) : null;
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return null;
  }
};

// 清除用户登录信息
const clearUserInfo = (): void => {
  window.localStorage.removeItem('userInfo');
  window.sessionStorage.removeItem('userInfo');
};

// 鉴权令牌请求拦截器
const authHeaderInterceptor = (config: AxiosRequestConfig) => {
  const authHeader: Record<string, string> = {};

  // 安全地复制headers
  if (config.headers) {
    if (typeof config.headers === 'object' && !Array.isArray(config.headers)) {
      Object.entries(config.headers).forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          authHeader[key] = value;
        }
      });
    }
  }

  const userInfo = getUserInfo();
  console.log('userInfo', userInfo);
  if (userInfo?.token) {
    authHeader['X-Auth-Token'] = userInfo.token;
  }

  return {
    ...config,
    headers: authHeader,
  };
};

// 错误处理函数
const errorHandler = (error: any) => {
  const { response, data } = error;

  if (response?.status) {
    const errorText = data?.msg || response.statusText;
    const { status } = response;

    // 状态码错误处理
    switch (status) {
      case 401:
        clearUserInfo();
        if (history.location.pathname !== '/user/login') {
          message.error('登录已过期，请重新登录');
          history.push('/user/login');
        }
        break;
      case 403:
        message.error('没有权限访问该资源');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 500:
        message.error('服务器错误，请联系管理员');
        break;
      default:
        message.error(errorText || '未知错误');
    }
  }

  if (data?.errorMessage) {
    message.error(data.errorMessage);
  }

  return Promise.reject(error);
};

/**
 * @name request 配置
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案
 * @doc https://umijs.org/docs/max/request
 */
export const errorConfig: RequestConfig = {
  // 错误处理配置
  errorConfig: {
    // 错误抛出
    errorThrower: (res: ResponseStructure) => {
      const { success, errorMessage, code } = res;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.code = code;
        error.data = res.data;
        throw error;
      }
    },
    // 错误接收及处理
    errorHandler,
  },

  // 请求拦截器
  requestInterceptors: [authHeaderInterceptor],

  // 响应拦截器
  responseInterceptors: [
    (response: AxiosResponse) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as { data: ResponseStructure };
      const path = response.request.responseURL;

      // 上传接口特殊处理
      if (path.includes('bcebos.com')) {
        return response;
      }

      // 处理业务码
      if (data?.code !== 0) {
        // 登录失效处理
        if (data.code === 999999) {
          clearUserInfo();
          const { location } = history;
          if (location.pathname !== '/user/login') {
            history.push('/user/login');
          }
          return Promise.reject({
            errorMessage: data.msg,
            code: data.code,
          });
        }

        return Promise.reject({
          errorMessage: data.msg,
          code: data.code,
          data: data.data,
        });
      }

      // 成功响应处理 - 只返回接口文档中定义的data字段内容
      // 保留原始响应结构，以满足Axios类型要求
      return {
        ...response,
        data: {
          success: true,
          data: data.data,
          errorMessage: '',
          errorCode: 0,
        },
      };
    },
  ],
};
