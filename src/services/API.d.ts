/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 11:47:24
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-20 15:13:57
 * @FilePath: \Antd-pro-Templete\src\services\API.d.ts
 * @Description: 全局接口类型定义
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
declare namespace API {
  /** 分页信息 */
  type PageResponse<T> = {
    current: number;
    pageSize: number;
    total: number;
    list: T[];
    success: boolean;
  };
  /** 分页请求 */
  type PageRequest = {
    current?: number;
    pageSize?: number;
  };
}
