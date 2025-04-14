/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 16:03:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 16:03:00
 * @FilePath: \Antd-pro-Templete\src\pages\List\BasicList\index.tsx
 * @Description: 基础列表
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { PageContainer } from '@ant-design/pro-components';
import { Card, List, Typography } from 'antd';

const BasicListPage: React.FC = () => {
  // 模拟数据
  const listData = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    title: `列表项 ${i + 1}`,
    description: `这是一个基础列表项，无需特殊权限即可访问。`,
  }));

  return (
    <PageContainer
      ghost
      header={{
        title: '基础列表',
      }}
    >
      <Card>
        <Typography.Title level={4}>基础列表页面</Typography.Title>
        <Typography.Paragraph>
          这是一个基础列表页面，所有登录用户都可以访问。此页面在路由配置中没有设置access属性，默认所有登录用户可访问。
        </Typography.Paragraph>

        <List
          itemLayout="horizontal"
          dataSource={listData}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </Card>
    </PageContainer>
  );
};

export default BasicListPage;
