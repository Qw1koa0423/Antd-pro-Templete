/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:10:00
 * @FilePath: \Antd-pro-Templete\src\pages\Home\index.tsx
 * @Description: 首页
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { useAccess, Access } from '@umijs/max';
import { Button, Card, Typography, Space, Divider, Table } from 'antd';

const HomePage: React.FC = () => {
  // 获取权限定义
  const access = useAccess();

  // 模拟API权限列表
  const mockApiPermissions = [
    { key: 'user:create', desc: '创建用户' },
    { key: 'user:read', desc: '查看用户' },
    { key: 'user:update', desc: '更新用户' },
    { key: 'user:delete', desc: '删除用户' },
    { key: 'admin:manage', desc: '管理员操作' },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: 'Umi权限示例页面',
      }}
    >
      <Card title="基于API权限列表的权限控制演示">
        <Typography.Title level={4}>1. 基础权限控制</Typography.Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Access
            accessible={access.isAdmin}
            fallback={
              <Button type="default" disabled>
                管理员操作（无权限）
              </Button>
            }
          >
            <Button type="primary">管理员操作</Button>
          </Access>

          <Access
            accessible={access.isLogin}
            fallback={
              <Button type="default" disabled>
                登录用户操作（未登录）
              </Button>
            }
          >
            <Button type="primary">登录用户操作</Button>
          </Access>
        </Space>

        <Divider />

        <Typography.Title level={4}>2. API权限控制示例</Typography.Title>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
          {mockApiPermissions.map((api) => (
            <Access
              key={api.key}
              accessible={access.canAccess(api.key)}
              fallback={
                <Button type="default" disabled>
                  {api.desc}（无权限）
                </Button>
              }
            >
              <Button type="primary">{api.desc}</Button>
            </Access>
          ))}
        </Space>

        <Divider />

        <Typography.Title level={4}>3. 权限表格示例</Typography.Title>
        <Table
          dataSource={mockApiPermissions}
          columns={[
            {
              title: 'API权限',
              dataIndex: 'key',
              key: 'key',
            },
            {
              title: '描述',
              dataIndex: 'desc',
              key: 'desc',
            },
            {
              title: '状态',
              key: 'status',
              render: (_, record) => (
                <Typography.Text type={access.canAccess(record.key) ? 'success' : 'danger'}>
                  {access.canAccess(record.key) ? '已授权' : '未授权'}
                </Typography.Text>
              ),
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Access
                  accessible={access.canAccess(record.key)}
                  fallback={<Button disabled>无权限</Button>}
                >
                  <Button type="primary">使用权限</Button>
                </Access>
              ),
            },
          ]}
        />

        <Divider />

        <Typography.Title level={4}>4. 原始权限对象值</Typography.Title>
        <pre>{JSON.stringify(access, null, 2)}</pre>
      </Card>
    </PageContainer>
  );
};

export default HomePage;
