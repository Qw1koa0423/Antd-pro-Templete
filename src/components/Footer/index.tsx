/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-29 09:08:23
 * @FilePath: \Templete\src\components\Footer\index.tsx
 * @Description: Footer
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
const Footer: React.FC = () => {
  const defaultMessage = '遥在前端出品';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: '遥在官网',
          title: '遥在科技',
          href: 'https://www.yaozai.net/',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/Qw1koa0423',
          blankTarget: true,
        },
        {
          key: '模板地址',
          title: '遥在科技后台模板',
          href: 'https://github.com/Qw1koa0423/Antd-pro-Templete.git',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
