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
const Options = () => {
  /** 权限 */
  const access = useAccess();
  /** 顶部切换的key */
  const [tabKey, setTabKey] = useState('log');
  /** 表格列 */
  const columns: ProColumns<Option.OperationLogListItem>[] = [
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
  const metas: ProListMetas<Option.PermissionListItem> = {
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
        <ProTable<Option.OperationLogListItem, API.PageRequest & { keyWords: string }>
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
        <ProList<Option.PermissionListItem>
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

export default Options;
