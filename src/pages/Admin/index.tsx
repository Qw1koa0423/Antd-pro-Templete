/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:00:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:05:30
 * @FilePath: \Antd-pro-Templete\src\pages\Admin\index.tsx
 * @Description: 管理员页面
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Alert } from 'antd';

const AdminPage: React.FC = () => {
  return (
    <PageContainer
      ghost
      header={{
        title: '管理员页面',
      }}
    >
      <Card>
        <Alert
          message="权限提示"
          description="此页面只有具有管理员权限的用户才能访问。"
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Typography.Title level={4}>管理员专用功能</Typography.Title>
        <Typography.Paragraph>
          这里是管理员可以访问的内容。在路由配置中，该页面使用了{' '}
          <code>access: &apos;isAdmin&apos;</code> 属性进行权限控制。
        </Typography.Paragraph>
        <Typography.Paragraph>
          系统通过检查用户的API权限列表，判断用户是否具有管理员权限。如果用户的API权限列表中包含{' '}
          <code>admin</code> 或以 <code>admin:</code> 开头的权限，则被视为管理员。
        </Typography.Paragraph>
      </Card>
    </PageContainer>
  );
};

export default AdminPage;
