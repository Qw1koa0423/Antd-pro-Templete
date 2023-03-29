/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-24 13:20:32
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 17:16:16
 * @FilePath: \Templete\src\pages\User\UserDetail.tsx
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { getUserDetail } from '@/services/user/api';
import { useParams } from '@umijs/max';

import { Avatar, Descriptions, Empty, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
const UserDetail: React.FC = () => {
  const urlParams = useParams<{ id: string }>();
  const [userDetail, setUserDetail] = useState<
    User.User & { permissionNames: string[]; roleNames: string; regionNames: string[] }
  >();
  useEffect(() => {
    if (!urlParams?.id) return;
    getUserDetail(+urlParams.id).then((res) => {
      setUserDetail(res);
    });
  }, []);
  return userDetail ? (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="用户ID">{userDetail.id}</Descriptions.Item>
      <Descriptions.Item label="账号">{userDetail.account}</Descriptions.Item>
      <Descriptions.Item label="密码">{userDetail.password}</Descriptions.Item>
      <Descriptions.Item label="用户名">
        <Space>
          <Avatar src={userDetail.avatar} />
          {userDetail.username}
        </Space>
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        <Typography.Text italic>{userDetail.createTime}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="最近一次更新时间">
        <Typography.Text italic>{userDetail.updateTime || '- -'}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="所在地区">
        {userDetail.regionNames.toString().replace(/,/g, ' ')}
      </Descriptions.Item>
      <Descriptions.Item label="角色">
        <Typography.Text mark>{userDetail.roleNames}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="权限" span={3}>
        <Space wrap>
          {userDetail.permissionNames.map((item) => {
            return (
              <Typography.Text key={item} keyboard>
                {item}
              </Typography.Text>
            );
          })}
        </Space>
      </Descriptions.Item>
    </Descriptions>
  ) : (
    <Empty />
  );
};

export default UserDetail;
