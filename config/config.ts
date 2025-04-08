/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:44:59
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 11:40:49
 * @FilePath: \Antd-pro-Templete\config\config.ts
 * @Description: UMI配置文件
 * @see: https://umijs.org/docs/api/config
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */

import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import routes from './routes';

export default defineConfig({
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  define: {
    API_URL: '', // API地址
  },
  /**
   * @name 国际化配置
   * @description 默认关闭，如需开启配置为 { antd: true, baseNavigator: true }
   * @doc https://umijs.org/docs/api/config#locale
   */
  locale: false,

  /**
   * @name 路由配置
   * @description 只支持 path，component，routes，redirect，wrappers，title 的配置
   * @doc https://umijs.org/docs/guides/routes
   */
  routes,

  /**
   * @name 主题配置
   * @description 支持antd主题定制
   * @doc https://ant.design/docs/react/customize-theme-cn
   */
  theme: {
    'root-entry-name': 'variable', // 使用CSS变量模式，支持动态主题切换
  },

  /**
   * @name 快速热更新配置
   * @description 保留state的热更新能力
   */
  fastRefresh: true,
  //============== 以下都是max的插件配置 ===============
  /**
   * @name 数据流插件
   * @description 配置model插件
   * @doc https://umijs.org/docs/max/data-flow
   */
  model: {},

  /**
   * @name 全局初始状态
   * @description 存放全局数据，如用户信息等
   * @doc https://umijs.org/docs/max/data-flow
   */
  initialState: {},

  /**
   * @name Layout插件
   * @description 开启layout插件并配置
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: '后台通用模板',
  layout: {
    locale: false,
    ...defaultSettings,
  },

  /**
   * @name moment转dayjs
   * @description 将项目中的moment替换为dayjs
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },

  /**
   * @name antd插件
   * @description 内置了babel import插件
   * @doc https://umijs.org/docs/max/antd
   */
  antd: {},

  /**
   * @name 网络请求配置
   * @description 基于axios和ahooks的useRequest
   * @doc https://umijs.org/docs/max/request
   */
  request: {},

  /**
   * @name 权限插件
   * @description 基于initialState的权限管理
   * @doc https://umijs.org/docs/max/access
   */
  access: {},

  /**
   * @name <head>中额外的script
   */
  headScripts: [
    // 解决首次加载时白屏的问题
    { src: '/scripts/loading.js', async: true },
  ],

  /**
   * @name 预设配置
   * @description 使用pro预设
   */
  presets: ['umi-presets-pro'],

  /**
   * @name openAPI配置
   * @description 基于OpenAPI生成接口代码
   * @doc https://pro.ant.design/zh-cn/docs/openapi/
   */
  openAPI: [],

  /**
   * @name MFSU配置 (Module Federation Speed Up)
   * @description 改进的构建性能和热更新速度
   * @doc https://umijs.org/docs/api/config#mfsu
   */
  mfsu: {
    strategy: 'eager', // 'normal'|'eager' eager模式提供更快的热更新
    shared: {
      react: {
        singleton: true,
      },
    },
  },

  /**
   * @name 请求日志记录
   * @description 记录所有请求数据便于调试
   */
  requestRecord: {},

  /**
   * @name 构建优化
   * @description 优化构建性能和产物大小
   */
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },

  /**
   * @name 构建工具配置
   * @description 配置Webpack构建参数
   */
  chainWebpack(memo) {
    // 可以在这里自定义webpack配置
    return memo;
  },

  /**
   * @name 开发工具配置
   * @description 提高开发体验
   */
  devtool: false,

  /**
   * @name 构建时压缩配置
   * @description 使用esbuild加速构建过程
   */
  jsMinifier: 'esbuild',
  cssMinifier: 'esbuild',
});
