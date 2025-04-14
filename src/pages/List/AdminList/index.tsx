/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:04:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 16:04:00
 * @FilePath: \Antd-pro-Templete\src\pages\List\AdminList\index.tsx
 * @Description: 管理员列表
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Typography, Tag, Space, Button } from 'antd';
import { useAccess } from '@umijs/max';

const AdminListPage: React.FC = () => {
  const access = useAccess();

  // 模拟数据
  const tableData = [
    {
      key: '1',
      name: '管理员用户1',
      role: 'admin',
      status: 'active',
      permission: ['admin', 'user:create', 'user:read', 'user:update', 'user:delete'],
    },
    {
      key: '2',
      name: '管理员用户2',
      role: 'admin',
      status: 'inactive',
      permission: ['admin', 'user:read', 'user:update'],
    },
    {
      key: '3',
      name: '超级管理员',
      role: 'super_admin',
      status: 'active',
      permission: [
        'admin',
        'system:config',
        'user:create',
        'user:read',
        'user:update',
        'user:delete',
      ],
    },
  ];

  const columns = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text: string) => (
        <Tag color={text === 'super_admin' ? 'red' : 'blue'}>{text.toUpperCase()}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <Tag color={text === 'active' ? 'green' : 'gray'}>
          {text === 'active' ? '活跃' : '非活跃'}
        </Tag>
      ),
    },
    {
      title: '权限',
      key: 'permission',
      dataIndex: 'permission',
      render: (permissions: string[]) => (
        <>
          {permissions.slice(0, 2).map((permission) => (
            <Tag color="volcano" key={permission}>
              {permission}
            </Tag>
          ))}
          {permissions.length > 2 && <Tag color="default">+{permissions.length - 2}</Tag>}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">
            查看
          </Button>
          <Button type="link" size="small">
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: '管理员列表',
      }}
    >
      <Card>
        <Typography.Title level={4}>管理员用户列表</Typography.Title>
        <Typography.Paragraph>
          这个页面需要管理员权限才能访问。在路由配置中使用了 <code>access: isAdmin</code>{' '}
          进行权限控制。
          {access.isAdmin && (
            <Tag color="green" style={{ marginLeft: 8 }}>
              您有管理员权限
            </Tag>
          )}
        </Typography.Paragraph>

        <Table columns={columns} dataSource={tableData} />
      </Card>
    </PageContainer>
  );
};

export default AdminListPage;
