/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-17 16:40:02
 * @LastEditors: 刘浩奇 liuhaoqi@insitpace.com
 * @LastEditTime: 2023-11-14 10:19:52
 * @FilePath: \Antd-pro-Templete\config\routes.ts
 * @Description: 路由配置
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [{ path: 'login', component: './Login' }],
  },
  {
    path: '/home',
    name: '首页',
    icon: 'smile',
    component: './Home',
  },

  { path: '/', redirect: '/home' },
  { path: '*', layout: false, component: './404' },
];
