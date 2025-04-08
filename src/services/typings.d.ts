/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2025-04-08 13:38:15
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 14:27:35
 * @FilePath: \Antd-pro-Templete\src\services\typings.d.ts
 * @Description: 通用API类型定义
 *
 * Copyright (c) 2025 by 遥在科技, All Rights Reserved.
 */

declare namespace API {
  /**
   * 通用API响应结构
   */
  interface BaseResponse<T = any> {
    /** 请求是否成功 */
    success: boolean;
    /** 响应数据 */
    data: T;
    /** 错误信息 */
    errorMessage?: string;
    /** 错误码 */
    errorCode?: number;
  }

  /**
   * 带分页的数据结构
   */
  interface PagedResponse<T = any> {
    /** 当前页码 */
    current: number;
    /** 每页条数 */
    pageSize: number;
    /** 总条数 */
    total: number;
    /** 数据列表 */
    list: T[];
  }

  /**
   * 分页请求参数
   */
  interface PageParams {
    /** 当前页码 */
    current?: number;
    /** 每页条数 */
    pageSize?: number;
  }

  /**
   * 通用查询参数
   */
  interface QueryParams extends PageParams {
    /** 关键词搜索 */
    keyword?: string;
    /** 查询的时间范围 */
    dateRange?: [string, string];
    /** 自定义查询参数 */
    [key: string]: any;
  }

  /**
   * 兼容 CustomSelect 组件的分页请求类型
   */
  interface PageRequest extends PageParams {
    /** 关键词 - 用于搜索 */
    keyword?: string;
    /** 自定义查询参数 */
    [key: string]: any;
  }

  /**
   * 兼容 CustomSelect 组件的分页响应类型
   */
  interface PageResponse<T = any> extends PagedResponse<T> {
    /** 数据列表 - 符合 CustomSelect 组件期望的格式 */
    list: Array<{
      label: React.ReactNode;
      value: any;
      [key: string]: any;
    }>;
  }
}
