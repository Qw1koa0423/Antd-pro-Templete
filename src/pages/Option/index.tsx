/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 15:31:47
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 15:50:52
 * @FilePath: \Templete\src\pages\option\index.tsx
 * @Description: 后台数据管理
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { getOperationLogList, getPermissionList } from '@/services/option/api';
import {
  PageContainer,
  ProColumns,
  ProList,
  ProListMetas,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Tag } from 'antd';
import { useState } from 'react';
const OptionsPage = () => {
  /** 权限 */
  const access = useAccess();
  /** 顶部切换的key */
  const [tabKey, setTabKey] = useState('log');
  /** 表格列 */
  const columns: ProColumns<OptionType.OperationLogListItem>[] = [
    {
      dataIndex: 'keyIndex',
      align: 'center',
      title: '序号',
    },
    {
      key: 'account',
      dataIndex: 'account',
      align: 'center',
      title: '账号',
    },
    {
      key: 'username',
      dataIndex: 'username',
      align: 'center',
      title: '用户名',
    },
    {
      key: 'createTime',
      dataIndex: 'createTime',
      align: 'center',
      title: '操作时间',
    },
    {
      key: 'detail',
      dataIndex: 'detail',
      align: 'center',
      title: '操作详情',
    },
  ];
  /** 表格列 */
  const metas: ProListMetas<OptionType.PermissionListItem> = {
    title: {
      dataIndex: 'name',
    },
    description: {
      dataIndex: 'path',
    },
    subTitle: {
      dataIndex: 'method',
      render: (text) => {
        if (text === 'GET') {
          return <Tag color="#5BD8A6">{text}</Tag>;
        } else {
          return <Tag color="#F6BD16">{text}</Tag>;
        }
      },
    },
  };
  return (
    <PageContainer
      fixedHeader
      tabList={[
        {
          tab: '操作日志',
          key: 'log',
          disabled: !access.normalFunction('/log/list'),
        },
        {
          tab: 'API列表',
          key: 'api',
          disabled: !access.normalFunction('/permission/list'),
        },
      ]}
      tabActiveKey={tabKey}
      onTabChange={(key) => {
        setTabKey(key);
      }}
    >
      {tabKey === 'log' ? (
        <ProTable<OptionType.OperationLogListItem, API.PageRequest & { keyWords: string }>
          key="logList"
          headerTitle="操作日志"
          columnEmptyText="- -"
          rowKey={(record) => record.id}
          columns={columns}
          options={false}
          request={async (params) => {
            const { list, total, current, pageSize, success } = await getOperationLogList(params);
            return {
              data: (list || []).map((item, index: number) => {
                item.keyIndex = (current - 1) * pageSize + (index + 1);
                return item;
              }),
              total,
              success,
            };
          }}
          search={false}
          pagination={{
            size: 'default',
            showTotal: (total: number) => `共 ${total} 条信息`,
            defaultPageSize: 10,
          }}
        ></ProTable>
      ) : (
        <ProList<OptionType.PermissionListItem>
          key="apiList"
          headerTitle="API列表"
          columnEmptyText="- -"
          metas={metas}
          search={false}
          rowKey={(record) => record.id}
          request={async () => {
            const { list } = await getPermissionList();
            return {
              data: list,
            };
          }}
          pagination={{
            hideOnSinglePage: true,
            size: 'default',
            showTotal: (total: number) => `共 ${total} 条信息`,
            defaultPageSize: 5,
          }}
        ></ProList>
      )}
    </PageContainer>
  );
};

export default OptionsPage;
