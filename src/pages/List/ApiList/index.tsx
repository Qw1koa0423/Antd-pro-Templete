/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:05:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 15:03:02
 * @FilePath: \Antd-pro-Templete\src\pages\List\ApiList\index.tsx
 * @Description: API权限列表
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Typography, Tag, Space, Button, Alert } from 'antd';
import { useAccess, Access } from '@umijs/max';

// 定义API权限数据类型
interface ApiPermission {
  key: string;
  name: string;
  module: string;
  description: string;
}

const ApiListPage: React.FC = () => {
  const access = useAccess();

  // 模拟API权限数据
  const apiPermissionsData: ApiPermission[] = [
    {
      key: 'user:create',
      name: '创建用户',
      module: '用户管理',
      description: '允许创建新用户',
    },
    {
      key: 'user:read',
      name: '查看用户',
      module: '用户管理',
      description: '允许查看用户信息',
    },
    {
      key: 'user:update',
      name: '更新用户',
      module: '用户管理',
      description: '允许更新用户信息',
    },
    {
      key: 'user:delete',
      name: '删除用户',
      module: '用户管理',
      description: '允许删除用户',
    },
    {
      key: 'user:list',
      name: '用户列表',
      module: '用户管理',
      description: '允许查看用户列表',
    },
    {
      key: 'role:create',
      name: '创建角色',
      module: '角色管理',
      description: '允许创建新角色',
    },
    {
      key: 'role:read',
      name: '查看角色',
      module: '角色管理',
      description: '允许查看角色信息',
    },
    {
      key: 'admin:manage',
      name: '管理员操作',
      module: '系统管理',
      description: '允许执行管理员操作',
    },
  ];

  const columns = [
    {
      title: 'API权限标识',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      key: 'module',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限状态',
      key: 'status',
      render: (_: unknown, record: ApiPermission) => (
        <Tag color={access.canAccess(record.key) ? 'success' : 'error'}>
          {access.canAccess(record.key) ? '已授权' : '未授权'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ApiPermission) => (
        <Access
          accessible={access.canAccess(record.key)}
          fallback={
            <Button type="text" disabled>
              使用权限
            </Button>
          }
        >
          <Space>
            <Button type="primary" size="small">
              使用权限
            </Button>
          </Space>
        </Access>
      ),
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: 'API权限列表',
      }}
    >
      <Card>
        <Alert
          message="权限说明"
          description={
            <>
              此页面需要用户具有 <code>user:list</code> 权限才能访问。 在路由配置中使用了{' '}
              <code>accessApi: &apos;user:list&apos;</code> 进行权限控制。
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Typography.Title level={4}>API权限管理</Typography.Title>
        <Typography.Paragraph>
          下表展示了系统中的API权限列表，以及当前用户是否拥有这些权限。 您当前
          {access.canAccess('user:list') ? '拥有' : '没有'} <code>user:list</code> 权限。
        </Typography.Paragraph>

        <Table columns={columns} dataSource={apiPermissionsData} pagination={{ pageSize: 5 }} />
      </Card>
    </PageContainer>
  );
};

export default ApiListPage;
