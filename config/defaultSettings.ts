/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-17 16:40:02
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 10:09:27
 * @FilePath: \Antd-pro-Templete\config\defaultSettings.ts
 * @Description: layout配置
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { ProLayoutProps } from '@ant-design/pro-components';
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: '后台模板',
  pwa: false,
  logo: '/logo.svg',
  iconfontUrl: '',

  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
};

export default Settings;
