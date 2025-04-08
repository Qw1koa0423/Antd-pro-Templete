import { LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { history, useModel } from '@umijs/max';
import { Spin, message } from 'antd';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { resetPassword } from '@/services/login/api';
import type { InitialStateType } from '@@/plugin-initialState/@@initialState';

const loginPath = '/user/login';

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return <span className="anticon">{currentUser?.username}</span>;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ children }) => {
  const actionClassName = useEmotionCss(({ token }) => ({
    display: 'flex',
    height: '48px',
    marginLeft: 'auto',
    overflow: 'hidden',
    alignItems: 'center',
    padding: '0 8px',
    cursor: 'pointer',
    borderRadius: token.borderRadius,
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  }));

  const { initialState, setInitialState } = useModel('@@initialState');
  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 预先定义菜单项，避免条件渲染中使用 useMemo
  const menuItems = useMemo(
    () => [
      {
        key: 'reset',
        icon: <LockOutlined />,
        label: '重置密码',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
    [],
  );

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = useCallback(async () => {
    window.localStorage.removeItem('userInfo');
    window.sessionStorage.removeItem('userInfo');
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== loginPath && !redirect) {
      history.replace({
        pathname: loginPath,
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  }, []);

  const onFinish = async (value: UserType.ResetPasswordParams) => {
    setConfirmLoading(true);
    try {
      await resetPassword(value);
      setOpen(false);
      loginOut();
      message.success('重置成功, 请重新登录！');
    } catch (error: any) {
      if (error?.errorMessage?.length > 0) {
        message.error(error.errorMessage);
      } else {
        message.error('重置密码失败！');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const onMenuClick = useCallback(
    (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setInitialState((s: InitialStateType) => ({
            settings: s?.settings || {},
            loading: s?.loading,
            currentUser: undefined,
          }));
        });
        loginOut();
        return;
      }
      if (key === 'reset') {
        setOpen(true);
        return;
      }
    },
    [setInitialState, loginOut],
  );

  const loading = (
    <span className={actionClassName}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  const { currentUser } = initialState || {};

  // 如果用户未登录，显示加载状态
  if (!currentUser || !currentUser.username) {
    return loading;
  }

  return (
    <Fragment>
      <ModalForm<UserType.ResetPasswordParams>
        width={500}
        onFinish={onFinish}
        title="密码重置"
        open={open}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => setOpen(false),
        }}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
          },
        }}
      >
        <ProFormText.Password
          label="旧密码"
          placeholder="请输入旧密码"
          required
          name="oldPass"
          rules={[
            {
              required: true,
              message: '请输入旧密码！',
            },
          ]}
        />
        <ProFormText.Password
          label="新密码"
          placeholder="请输入新密码"
          required
          tooltip="必须包含大写字母、小写字母、数字，最小长度6位，最大长度10位"
          name="newPass"
          rules={[
            {
              required: true,
              message: '请输入新密码！',
            },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,10}$/,
              message: '请输入正确格式的密码！',
            },
          ]}
        />
        <ProFormText.Password
          label="确认密码"
          placeholder="请再次输入密码"
          required
          name="rePass"
          rules={[
            {
              required: true,
              message: '请再次输入密码！',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPass') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致！'));
              },
            }),
          ]}
        />
      </ModalForm>
      <HeaderDropdown
        menu={{
          selectedKeys: [],
          onClick: onMenuClick,
          items: menuItems,
        }}
      >
        {children}
      </HeaderDropdown>
    </Fragment>
  );
};
