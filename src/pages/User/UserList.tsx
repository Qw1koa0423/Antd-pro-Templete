import { getUploadParams } from '@/services/account/api';
import { getRoleList } from '@/services/role/api';
import { addUser, deleteUser, getUserDetail, getUserList, updateUser } from '@/services/user/api';
import * as AREA from '@/utils/area.json';
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProForm,
  ProFormCascader,
  ProFormSelect,
  ProFormText,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { Avatar, Button, message, Popconfirm, Space, Upload } from 'antd';
import { RcFile, UploadChangeParam, UploadFile } from 'antd/lib/upload';
import React, { useRef, useState } from 'react';
type MODALFORM_TYPE = {
  username: string;
  account: string;
  password: string;
  avatar: UploadFile[];
  region: number[];
  role: number;
};

const UserList: React.FC = () => {
  /** 权限 */
  const access = useAccess();
  /** 获取Table实例 */
  const actionRef = useRef<ActionType>();
  /** 弹窗状态 */
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  /** 编辑初始值 */
  const [userId, setUserId] = useState<number>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  /** 表格列 */
  const columns: ProColumns<User.UserListItem>[] = [
    {
      dataIndex: 'keyIndex',
      title: '序号',
      search: false,
    },
    {
      key: 'account',
      dataIndex: 'account',
      align: 'center',
      title: '账号',
      formItemProps: {
        name: 'keyWords',
        label: '模糊搜索',
      },
      fieldProps: {
        placeholder: '请输入账号或用户名',
      },
      render(text, record) {
        return (
          <Space
            style={{
              width: '75%',
            }}
          >
            <Avatar src={record.avatar} />
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      key: 'username',
      dataIndex: 'username',
      align: 'center',
      title: '用户名',
      search: false,
    },
    {
      key: 'roleName',
      dataIndex: 'roleName',
      align: 'center',
      title: '角色',
      valueType: 'select',
      debounceTime: 500,
      search: !access.normalFunction('/role/list') ? false : undefined,
      fieldProps: {
        placeholder: '请输入并选择角色名称',
        showSearch: true,
        fieldNames: {
          label: 'name',
          value: 'id',
        },
      },
      formItemProps: {
        name: 'roleId',
      },
      request: async (params) => {
        const { list } = await getRoleList({ name: params?.keyWords });
        return list || [];
      },
    },
    {
      key: 'region',
      dataIndex: 'region',
      align: 'center',
      title: '地址',
      search: false,
      render: (text) => {
        return text?.toString().replace(/,/g, ' ');
      },
    },
    {
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      title: '在线状态',
      search: false,
      filters: true,
      onFilter: true,
      valueEnum: {
        0: {
          text: '离线',
          status: 'Error',
        },
        1: {
          text: '在线',
          status: 'Success',
        },
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
      hideInTable: !access.normalFunction(['/user/delete', '/user/update,', '/user/detail']),
      render: (text, record) => {
        return (
          <Space>
            <Access accessible={access.normalFunction('/user/update') || false}>
              <Button
                type="link"
                onClick={() => {
                  setUserId(record.id);
                  setModalOpen(true);
                }}
              >
                编辑
              </Button>
            </Access>
            <Access accessible={access.normalFunction('/user/delete') || false}>
              <Popconfirm
                title="确定删除该用户吗?"
                okText="确定"
                cancelText="取消"
                onConfirm={async () => {
                  setConfirmLoading(true);
                  try {
                    await deleteUser({ id: record.id });
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
            <Access accessible={access.normalFunction('/user/detail') || false}>
              <Button
                type="link"
                onClick={() => {
                  history.push(`/user/detail/${record.id}`);
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
  /** 上传前处理 */
  const beforeUpload = (file: RcFile) => {
    setConfirmLoading(true);
    if (file.size > 102400) {
      message.error('文件大小不能超过100KB');
      setConfirmLoading(false);
      return Upload.LIST_IGNORE;
    }
    if (!/image\/(png|jpg|jpeg)/.test(file.type)) {
      message.error('请上传png、jpg、jpeg格式的图片!');
      setConfirmLoading(false);
      return Upload.LIST_IGNORE;
    }
    if (
      window.localStorage.getItem('uploadData') === null ||
      JSON.parse(window.localStorage.getItem('uploadData') || '{}').expiredTime < Date.now()
    ) {
      getUploadParams().then((res) => {
        window.localStorage.setItem('uploadData', JSON.stringify(res));
      });
    }
    return file;
  };
  /** 文件改变 */
  const onFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      setConfirmLoading(false);
    }
    return;
  };
  /** 文件参数 */
  const fileData = (file: UploadFile<any>) => {
    return {
      key: file.thumbUrl,
    };
  };
  /** 提交表单事件 */
  const onFinish = async (values: MODALFORM_TYPE) => {
    setConfirmLoading(true);
    const { username, account, password, avatar, region, role } = values;
    if (userId) {
      try {
        await updateUser({
          id: userId,
          username,
          password,
          avatar: avatar[0].thumbUrl || '',
          region,
          role: [role],
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
        await addUser({
          username,
          account,
          password,
          avatar: avatar[0].thumbUrl || '',
          region,
          role: [role],
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
    <>
      <ProTable<User.UserListItem, API.PageRequest & User.UserListParams>
        key="userList"
        columnEmptyText="- -"
        rowKey={(record) => record.id}
        actionRef={actionRef}
        columns={columns}
        options={false}
        request={async (params) => {
          const { list, total, current, pageSize, success } = await getUserList(params);
          return {
            data: (list || []).map((item: User.UserListItem, index: number) => {
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
              <Space key="UserSearchOption">
                {dom}
                <Access
                  accessible={
                    (access.normalFunction('/user/add') && access.normalFunction('/role/list')) ||
                    false
                  }
                >
                  <Button
                    key="addUser"
                    type="primary"
                    onClick={() => {
                      setModalOpen(true);
                    }}
                  >
                    添加用户
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
        title={userId ? '编辑用户' : '添加用户'}
        open={modalOpen}
        onOpenChange={(visible) => {
          setModalOpen(visible);
          if (!visible) {
            setUserId(undefined);
          }
        }}
        request={async () => {
          if (!userId) return {} as MODALFORM_TYPE;
          const res = await getUserDetail(userId);
          return {
            account: res.account,
            username: res.username,
            password: res.password,
            avatar: [
              { uid: res.account, url: res.avatar, name: res.username, thumbUrl: res.avatar },
            ],
            region: res.region,
            role: res.role[0],
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
        <ProForm.Group>
          <ProFormText
            name="account"
            label="账号"
            required
            tooltip="支持数字、字母,最大11位。"
            width="md"
            fieldProps={{
              maxLength: 11,
              disabled: userId ? true : false,
            }}
            rules={[
              {
                required: true,
                message: '请输入账号!',
              },
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message: '请输入正确格式的账号!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            label="密码"
            required
            tooltip="支持数字、字母、下划线,最大16位。"
            width="md"
            fieldProps={{
              maxLength: 16,
            }}
            rules={[
              {
                required: true,
                message: '请输入密码!',
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: '请输入正确格式的密码!',
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="username"
            label="用户名"
            required
            tooltip="支持汉字、字母、下划线,最大8位。"
            width="md"
            fieldProps={{
              maxLength: 8,
            }}
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
              {
                pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
                message: '请输入正确格式的用户名!',
              },
            ]}
          />
          <ProFormSelect
            name="role"
            label="角色"
            required
            width="md"
            fieldProps={{
              showSearch: true,
              fieldNames: { label: 'name', value: 'id' },
            }}
            debounceTime={500}
            request={async (params) => {
              const { list } = await getRoleList({ name: params?.keyWords });
              return list || [];
            }}
            rules={[
              {
                required: true,
                message: '请选择角色!',
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormCascader
            name="region"
            label="区域"
            required
            width="lg"
            fieldProps={{
              placeholder: '请选择区域',
              options: AREA.default,
            }}
            rules={[
              {
                required: true,
                message: '请选择区域!',
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormUploadButton
            title="上传头像"
            label="头像"
            name="avatar"
            required
            max={1}
            tooltip="支持jpg和png大小不超过100KB"
            fieldProps={{
              name: 'file',
              accept: 'image/*',
              action: JSON.parse(window.localStorage.getItem('uploadData') || '{}').endPoint,
              beforeUpload,
              onChange: onFileChange,
              data: fileData,
            }}
          />
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default UserList;
