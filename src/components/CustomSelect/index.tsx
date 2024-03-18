/*
 * @Author: Liu Haoqi liuhaoqw1ko@gmail.com
 * @Date: 2023-11-28 09:53:45
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-11-28 17:52:37
 * @FilePath: \park-walk-console\src\components\CustomSelect\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { ProFormSelect } from '@ant-design/pro-components';
import type { ProFormSelectProps } from '@ant-design/pro-components';
import { Pagination } from 'antd';
import { useState } from 'react';
type Props = Omit<ProFormSelectProps, 'fieldProps' | 'request'> & {
  _fieldProps: ProFormSelectProps['fieldProps'];
  _request: (params: API.PageRequest | any) => Promise<API.PageResponse<any>>;
  _params?: API.PageRequest | any;
};
const CustomSelect = (props: Props) => {
  const { _fieldProps, _request, _params } = props;
  const [pageInfo, setPageInfo] = useState<{
    pageSize: number;
    current: number;
  }>({
    pageSize: 8,
    current: 1,
  });
  const [total, setTotal] = useState<number>(0);
  return (
    <ProFormSelect
      {...props}
      fieldProps={{
        ..._fieldProps,
        onSearch: () => {
          setPageInfo({
            pageSize: 8,
            current: 1,
          });
        },
        onFocus: () => {
          setPageInfo({
            pageSize: 8,
            current: 1,
          });
        },
        dropdownRender(menu) {
          return (
            <>
              {menu}
              <Pagination
                size="small"
                style={{
                  float: 'right',
                }}
                hideOnSinglePage
                total={total}
                pageSize={pageInfo?.pageSize}
                current={pageInfo?.current}
                onChange={(page, pageSize) => {
                  setPageInfo({
                    pageSize,
                    current: page,
                  });
                }}
              />
            </>
          );
        },
      }}
      debounceTime={500}
      params={{
        ...pageInfo,
        ..._params,
      }}
      request={async (params) => {
        const { list, current, pageSize, total } = await _request?.(params);
        console.log('params', params);
        setTotal(total);
        setPageInfo({
          pageSize,
          current,
        });
        return list;
      }}
    />
  );
};
export default CustomSelect;
