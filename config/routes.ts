/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-17 16:40:02
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-22 11:45:40
 * @FilePath: \Templete\config\routes.ts
 * @Description: 路由配置
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [{ path: '/login', component: './login' }],
  },
  {
    path: '/home',
    name: '首页',
    icon: 'smile',
    component: './home',
  },

  { path: '/', redirect: '/home' },
  { path: '*', layout: false, component: './404' },
];
