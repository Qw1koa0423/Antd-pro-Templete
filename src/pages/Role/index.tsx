/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 15:31:47
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:51:10
 * @FilePath: \Templete\src\pages\role\index.tsx
 * @Description: 角色管理
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { getPermissionList } from '@/services/option/api';
import { addRole, deleteRole, getRoleDetail, getRoleList, updateRole } from '@/services/role/api';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Descriptions, Drawer, message, Popconfirm, Space, Typography } from 'antd';
import { useRef, useState } from 'react';
type MODALFORM_TYPE = {
  name: string;
  permissions: number[];
};
const RolePage = () => {
  /** 权限 */
  const access = useAccess();
  /** 获取Table实例 */
  const actionRef = useRef<ActionType>();
  /** 弹窗状态 */
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  /** 抽屉状态 */
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  /** 编辑初始值 */
  const [roleId, setRoleId] = useState<number>();
  /** 角色详情 */
  const [roleDetail, setRoleDetail] = useState<RoleType.Role>();
  /** 按钮loading状态 */
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  /** 表格列 */
  const columns: ProColumns<RoleType.RoleListItem>[] = [
    {
      dataIndex: 'keyIndex',
      title: '序号',
      search: false,
    },
    {
      key: 'name',
      dataIndex: 'name',
      align: 'center',
      title: '角色名称',
      fieldProps: {
        placeholder: '请输入角色名称',
      },
    },

    {
      key: 'createTime',
      dataIndex: 'createTime',
      align: 'center',
      title: '创建时间',
      valueType: 'dateTimeRange',
      colSize: 2,
      fieldProps: {
        placeholder: ['请选择开始时间', '请选择结束时间'],
      },
      search: {
        transform: (value: any) => ({ startTime: value[0], endTime: value[1] }),
      },
      render: (text, record) => {
        return <span>{record.createTime}</span>;
      },
    },
    {
      key: 'updateTime',
      dataIndex: 'updateTime',
      align: 'center',
      title: '最近更新时间',
      search: false,
    },
    {
      key: 'options',
      align: 'center',
      title: '操作',
      search: false,
      hideInTable: !access.normalFunction(['/role/update', '/role/delete', '/role/detail']),
      render: (text, record) => {
        return (
          <Space>
            <Access accessible={access.normalFunction('/role/update') || false}>
              <Button
                type="link"
                onClick={() => {
                  setRoleId(record.id);
                  setModalOpen(true);
                }}
              >
                编辑
              </Button>
            </Access>
            <Access accessible={access.normalFunction('/role/delete') || false}>
              <Popconfirm
                title="确定删除该角色吗?"
                okText="确定"
                cancelText="取消"
                onConfirm={async () => {
                  setConfirmLoading(true);
                  try {
                    await deleteRole({ id: record.id });
                    setConfirmLoading(false);
                    actionRef.current?.reload().then(() => {
                      message.success('删除成功');
                    });
                    return true;
                  } catch (error: any) {
                    setConfirmLoading(false);
                    if (error?.errorMessage.length > 0) {
                      message.error(error?.errorMessage);
                    } else {
                      message.error('删除失败');
                    }
                    return false;
                  }
                }}
                okButtonProps={{ loading: confirmLoading }}
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            </Access>
            <Access accessible={access.normalFunction('/role/detail') || false}>
              <Button
                type="link"
                onClick={async () => {
                  try {
                    const res = await getRoleDetail(record.id);
                    setRoleDetail(res);
                    setDrawerOpen(true);
                  } catch (error: any) {
                    if (error?.errorMessage.length > 0) {
                      message.error(error?.errorMessage);
                    } else {
                      message.error('获取角色详情失败');
                    }
                  }
                }}
              >
                查看详情
              </Button>
            </Access>
          </Space>
        );
      },
    },
  ];
  /** 提交表单事件 */
  const onFinish = async (values: MODALFORM_TYPE) => {
    setConfirmLoading(true);
    const { name, permissions } = values;
    if (roleId) {
      try {
        await updateRole({
          id: roleId,
          name,
          permissions,
        });
        setConfirmLoading(false);
        setModalOpen(false);
        actionRef.current?.reload().then(() => {
          message.success('更新成功！');
        });
      } catch (error: any) {
        setConfirmLoading(false);
        if (error?.errorMessage.length > 0) {
          message.error(error.errorMessage);
        } else {
          message.error('更新失败，请重试！');
        }
      }
    } else {
      try {
        await addRole({
          name,
          permissions,
        });
        setConfirmLoading(false);
        setModalOpen(false);
        actionRef.current?.reload().then(() => {
          message.success('添加成功！');
        });
      } catch (error: any) {
        setConfirmLoading(false);
        if (error?.errorMessage.length > 0) {
          message.error(error.errorMessage);
        } else {
          message.error('添加失败，请重试！');
        }
      }
    }
  };
  return (
    <PageContainer>
      <ProTable<RoleType.RoleListItem, API.PageRequest & RoleType.RoleListParams>
        key="userList"
        columnEmptyText="- -"
        rowKey={(record) => record.id}
        actionRef={actionRef}
        columns={columns}
        options={false}
        request={async (params) => {
          const { list, total, current, pageSize, success } = await getRoleList(params);
          return {
            data: (list || []).map((item: RoleType.RoleListItem, index: number) => {
              item.keyIndex = (current - 1) * pageSize + (index + 1);
              return item;
            }),
            total,
            success,
          };
        }}
        search={{
          span: 4,
          labelWidth: 'auto',
          showHiddenNum: true,
          searchText: '查询',
          resetText: '重置',
          optionRender: (searchConfig, formProps, dom) => {
            return [
              <Space key="RoleSearchOption">
                {dom}
                <Access
                  accessible={
                    (access.normalFunction('/role/add') &&
                      access.normalFunction('/permission/list')) ||
                    false
                  }
                >
                  <Button
                    key="addRole"
                    type="primary"
                    onClick={() => {
                      setModalOpen(true);
                    }}
                  >
                    添加角色
                  </Button>
                </Access>
              </Space>,
            ];
          },
        }}
        pagination={{
          hideOnSinglePage: true,
          size: 'default',
          showTotal: (total: number) => `共 ${total} 条信息`,
          defaultPageSize: 10,
        }}
      ></ProTable>
      <ModalForm<MODALFORM_TYPE>
        title={roleId ? '编辑角色' : '添加角色'}
        open={modalOpen}
        onOpenChange={(visible) => {
          setModalOpen(visible);
          if (!visible) {
            setRoleId(undefined);
          }
        }}
        request={async () => {
          if (!roleId) return {} as MODALFORM_TYPE;
          const res = await getRoleDetail(roleId);
          return {
            name: res.name,
            permissions: res.permissions,
          };
        }}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okButtonProps: {
            loading: confirmLoading,
          },
        }}
        onFinish={onFinish}
      >
        <ProFormText
          name="name"
          label="角色名"
          required
          tooltip="支持汉字、字母、下划线,最大8位。"
          width="md"
          fieldProps={{
            maxLength: 8,
          }}
          rules={[
            {
              required: true,
              message: '请输入角色名!',
            },
            {
              pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
              message: '请输入正确格式的角色名!',
            },
          ]}
        />
        <ProFormSelect
          name="permissions"
          label="权限配置"
          required
          tooltip="至少选择一个权限"
          mode="multiple"
          fieldProps={{
            placeholder: '请选择权限',
            onChange(value, option) {
              console.log(value, option);
              return value + 1;
            },
          }}
          request={async () => {
            const { list } = await getPermissionList();
            return list.map((item) => {
              return {
                label: item.name,
                value: item.id,
                path: item.path,
              };
            });
          }}
          rules={[
            {
              required: true,
              message: '请选择权限!',
            },
          ]}
        ></ProFormSelect>
      </ModalForm>
      <Drawer
        title="角色详情"
        open={drawerOpen}
        destroyOnClose
        width="auto"
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="角色ID">{roleDetail?.id}</Descriptions.Item>
          <Descriptions.Item label="角色名">{roleDetail?.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{roleDetail?.createTime}</Descriptions.Item>
          <Descriptions.Item label="最近一次更新时间">
            {roleDetail?.updateTime || '- -'}
          </Descriptions.Item>
          <Descriptions.Item label="权限配置">
            <Space wrap>
              {roleDetail?.permissionNames.map((item) => {
                return (
                  <Typography.Text key={item} keyboard>
                    {item}
                  </Typography.Text>
                );
              })}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </PageContainer>
  );
};

export default RolePage;
