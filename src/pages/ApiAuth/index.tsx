/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:02:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 16:02:00
 * @FilePath: \Antd-pro-Templete\src\pages\ApiAuth\index.tsx
 * @Description: API权限页面
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Card, Typography, Alert, Descriptions } from 'antd';

const ApiAuthPage: React.FC = () => {
  const access = useAccess();

  return (
    <PageContainer
      ghost
      header={{
        title: 'API权限页面',
      }}
    >
      <Card>
        <Alert
          message="权限提示"
          description="此页面需要用户拥有 user:read 权限才能访问。"
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Typography.Title level={4}>基于具体API权限的页面</Typography.Title>
        <Typography.Paragraph>
          这里是拥有特定API权限的用户可以访问的内容。在路由配置中，该页面使用了{' '}
          <code>accessApi: &apos;user:read&apos;</code> 属性进行权限控制。
        </Typography.Paragraph>
        <Typography.Paragraph>
          系统通过检查用户的API权限列表中是否包含 <code>user:read</code>{' '}
          权限，来判断用户是否能访问此页面。
        </Typography.Paragraph>

        <Descriptions title="当前用户权限信息" bordered column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label="是否登录">{access.isLogin ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="是否管理员">{access.isAdmin ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="拥有user:read权限">
            {access.canAccess('user:read') ? '是' : '否'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
};

export default ApiAuthPage;
