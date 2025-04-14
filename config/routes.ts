/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-17 16:40:02
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:09:50
 * @FilePath: \Antd-pro-Templete\config\routes.ts
 * @Description: 路由配置
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: '登录',
        path: '/user/login',
        component: './Login',
      },
    ],
  },
  {
    path: '/home',
    name: '首页',
    icon: 'smile',
    component: './Home',
  },
  {
    path: '/admin',
    name: '管理员页面',
    icon: 'crown',
    access: 'isAdmin', // 使用access.ts中定义的isAdmin权限判断
    component: './Admin',
  },
  {
    path: '/protected',
    name: '受保护页面',
    icon: 'lock',
    access: 'isLogin', // 使用access.ts中定义的isLogin权限判断
    component: './Protected',
  },
  {
    path: '/api-auth',
    name: 'API权限页面',
    icon: 'api',
    // 使用accessApi属性指定所需的API权限
    accessApi: 'user:read', // 用户需要有user:read权限才能访问此页面
    component: './ApiAuth',
  },
  {
    path: '/list',
    name: '列表页面',
    icon: 'table',
    routes: [
      {
        path: '/list',
        redirect: '/list/basic-list',
      },
      {
        path: '/list/basic-list',
        name: '基础列表',
        component: './List/BasicList',
      },
      {
        path: '/list/admin-list',
        name: '管理员列表',
        access: 'isAdmin', // 需要管理员权限
        component: './List/AdminList',
      },
      {
        path: '/list/api-list',
        name: 'API权限列表',
        accessApi: 'user:list', // 使用API权限控制
        component: './List/ApiList',
      },
    ],
  },
  { path: '/', redirect: '/home' },
  { path: '*', layout: false, component: './404' },
];
