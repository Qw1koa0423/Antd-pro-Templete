/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 15:31:47
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:51:21
 * @FilePath: \Templete\src\pages\User\index.tsx
 * @Description: 用户页面当父路由渲染子路由
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-layout';
import { Outlet } from '@umijs/max';
import React from 'react';

const UserPage: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default UserPage;
