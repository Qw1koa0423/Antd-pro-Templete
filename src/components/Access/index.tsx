/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-14 15:00:00
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-14 14:48:19
 * @FilePath: \Antd-pro-Templete\src\components\Access\index.tsx
 * @Description: 权限控制组件
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */
import { useAccess } from '@umijs/max';
import { ReactNode } from 'react';

interface AccessProps {
  accessible?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * 权限控制组件
 * @param props
 * @returns
 */
const Access: React.FC<AccessProps> = (props) => {
  // 当 props 中有 accessible 时，直接使用 props 中的值
  // 当 props 中没有 accessible 时，使用 useAccess 中返回的值
  const { accessible = true, fallback = null, children } = props;

  if (accessible) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * 页面级权限控制组件
 * 必须使用通过useAccess来判断权限
 * @param props
 * @returns
 */
export const AccessWithHook: React.FC<{
  accessKey: string;
  fallback?: ReactNode;
  children: ReactNode;
}> = (props) => {
  const { accessKey, fallback = null, children } = props;
  const access = useAccess();

  // 使用access对象中的属性或方法来判断权限
  // @ts-ignore
  const accessible = access[accessKey] || false;

  if (accessible) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default Access;
