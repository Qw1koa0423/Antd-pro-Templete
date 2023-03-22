/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-22 13:13:14
 * @FilePath: \Templete\src\pages\User\Login\index.tsx
 * @Description: 登录
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { login } from '@/services/user/api';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { message } from 'antd';
import React from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';
const Login: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });
  const handleSubmit = async (values: User.LoginParams) => {
    try {
      // 登录
      const userInfo = await login({
        ...values,
      });
      window.localStorage.setItem(
        'userInfo',
        JSON.stringify({ ...userInfo, account: values.account }),
      );
      window.sessionStorage.setItem(
        'userInfo',
        JSON.stringify({ ...userInfo, account: values.account }),
      );
      if (userInfo) {
        flushSync(() => {
          setInitialState((s: any) => ({
            ...s,
            currentUser: { ...userInfo, account: values.account },
          }));
        });
        message.success('登录成功！');
        if (!history) return;
        history.push('/');
      }
    } catch (error: any) {
      if (error.errorMessage.length > 0) {
        message.error(error.errorMessage);
      } else {
        message.error('登录失败，请重试！');
      }
    }
  };
  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          // flex: '1',
          marginBottom: 260,
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="后台通用模板"
          subTitle="后台通用模板"
          onFinish={async (values) => {
            await handleSubmit(values as User.LoginParams);
          }}
        >
          <ProFormText
            name="account"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined />,
              maxLength: 11,
            }}
            placeholder={'用户名'}
            rules={[
              {
                required: true,
                message: '请输入用户名！',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined />,
              maxLength: 16,
            }}
            placeholder={'密码'}
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </LoginForm>
      </div>
    </div>
  );
};
export default Login;
