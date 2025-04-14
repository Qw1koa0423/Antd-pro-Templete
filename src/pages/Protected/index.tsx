/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:01:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 16:01:00
 * @FilePath: \Antd-pro-Templete\src\pages\Protected\index.tsx
 * @Description: 受保护页面
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Alert } from 'antd';

const ProtectedPage: React.FC = () => {
  return (
    <PageContainer
      ghost
      header={{
        title: '受保护页面',
      }}
    >
      <Card>
        <Alert
          message="权限提示"
          description="此页面需要用户登录后才能访问。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Typography.Title level={4}>登录用户可见内容</Typography.Title>
        <Typography.Paragraph>
          这里是登录用户可以访问的内容。在路由配置中，该页面使用了{' '}
          <code>access: &apos;isLogin&apos;</code> 属性进行权限控制。
        </Typography.Paragraph>
        <Typography.Paragraph>
          系统通过检查用户信息是否存在，来判断用户是否已登录。未登录用户将无法访问此页面，会被自动重定向到登录页面。
        </Typography.Paragraph>
      </Card>
    </PageContainer>
  );
};

export default ProtectedPage;
