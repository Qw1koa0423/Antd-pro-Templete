/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-17 16:40:02
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:43:21
 * @FilePath: \Templete\config\routes.ts
 * @Description: 路由配置
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
export default [
  {
    path: '/login',
    layout: false,
    routes: [{ path: '/login', component: './login' }],
  },
  {
    path: '/home',
    name: '首页',
    icon: 'smile',
    component: './home',
  },
  {
    path: '/user',
    name: '用户管理',
    icon: 'AliwangwangOutlined',
    component: './user',
    routes: [
      {
        index: true,
        name: '用户列表',
        component: './user/user_list',
        access: 'normalRouteFilter',
        api: ['/user/list', '/user/detail', '/user/add', '/user/update', '/user/delete'],
      },
      {
        path: 'detail/:id',
        name: '用户详情',
        component: './user/user_detail',
        hideInMenu: true,
        access: 'normalRouteFilter',
        api: ['/user/detail'],
      },
    ],
  },
  {
    path: '/role',
    name: '角色管理',
    icon: 'AndroidOutlined',
    component: './role',
    access: 'normalRouteFilter',
    api: ['/role/list', '/role/detail', '/role/add', '/role/update', '/role/delete'],
  },
  {
    path: '/option',
    name: '后台数据',
    icon: 'AreaChartOutlined',
    component: './option',
    access: 'normalRouteFilter',
    api: ['/permission/list', '/log/list'],
  },
  { path: '/', redirect: '/home' },
  { path: '*', layout: false, component: './404' },
];
