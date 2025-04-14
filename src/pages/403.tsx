/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:20:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 16:20:00
 * @FilePath: \Antd-pro-Templete\src\pages\403.tsx
 * @Description: 403 权限拒绝页面
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { Button, Result } from 'antd';
import React from 'react';
import { history } from '@umijs/max';

const NoAccess: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="抱歉，您没有访问此页面的权限。"
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        返回首页
      </Button>
    }
  />
);

export default NoAccess;
