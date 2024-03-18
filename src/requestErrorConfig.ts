/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-18 10:53:53
 * @FilePath: \Antd-pro-Templete\src\requestErrorConfig.ts
 * @Description: request错误处理
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';

import type { RequestOptionsInit } from 'umi-request';
interface ResponseStructure {
  code: number;
  msg: string;
  data: any;
}
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const authHeader = options?.headers ?? {};
  const storage =
    window.sessionStorage.getItem('userInfo') || window.localStorage.getItem('userInfo');
  if (storage) {
    const currentUser = JSON.parse(storage);
    if (currentUser.token) {
      authHeader['X-Auth-Token'] = currentUser.token;
    }
  }
  return {
    url: `${url}`,
    options: { ...options, interceptors: true, headers: authHeader },
  };
};

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: () => {},
    // 错误接收及处理
    errorHandler: () => {},
  },

  // 请求拦截器
  requestInterceptors: [authHeaderInterceptor],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;
      const path = response.request.responseURL;
      // 上传接口没有 code
      if (path.includes('bcebos.com')) {
        return response;
      }
      if (data?.code !== 0) {
        if (data.code === 999999) {
          window.localStorage.removeItem('userInfo');
          window.sessionStorage.removeItem('userInfo');
          const { location } = history;
          if (location.pathname !== '/user/login') {
            history.push('/user/login');
          }
          return Promise.reject({
            errorMessage: data.msg,
          });
        }
        return Promise.reject({
          errorMessage: data.msg,
        });
      }
      return {
        ...data,
        success: data.code === 0 || data.code === 999999,
        errorMessage: data.code === 0 || data.code === 999999 ? '' : data.msg || '',
      };
    },
  ],
};
