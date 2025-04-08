import { ProFormSelect } from '@ant-design/pro-components';
import type { ProFormSelectProps } from '@ant-design/pro-components';
import { Pagination, ConfigProvider } from 'antd';
import { useCallback, useState, useMemo, memo, useEffect } from 'react';

type CustomSelectProps = Omit<ProFormSelectProps, 'fieldProps' | 'request'> & {
  selectProps?: ProFormSelectProps['fieldProps'];
  fetchData: (params: API.PageRequest) => Promise<API.PageResponse<any>>;
  queryParams?: Record<string, any>;
  defaultPageSize?: number;
  fetchLabelByValue?: (value: any) => Promise<{ label: React.ReactNode; value: any }>;
};

const CustomSelect = memo((props: CustomSelectProps) => {
  const {
    selectProps = {},
    fetchData,
    queryParams,
    defaultPageSize = 8,
    fetchLabelByValue,
    ...restProps
  } = props;

  const [pageInfo, setPageInfo] = useState<API.PageRequest>({
    pageSize: defaultPageSize,
    current: 1,
  });

  const [total, setTotal] = useState<number>(0);

  const [initialOptions, setInitialOptions] = useState<{ label: React.ReactNode; value: any }[]>(
    [],
  );

  useEffect(() => {
    const fetchInitialLabel = async () => {
      const currentValue = selectProps?.value;

      if (currentValue !== undefined && currentValue !== null && fetchLabelByValue) {
        try {
          if (Array.isArray(currentValue)) {
            const options = await Promise.all(
              currentValue.map((value) => fetchLabelByValue(value)),
            );
            setInitialOptions(options);
          } else {
            const option = await fetchLabelByValue(currentValue);
            setInitialOptions([option]);
          }
        } catch (error) {
          console.error('获取初始标签失败:', error);
        }
      }
    };

    fetchInitialLabel();
  }, [selectProps?.value, fetchLabelByValue]);

  const resetPagination = useCallback(() => {
    setPageInfo({
      pageSize: defaultPageSize,
      current: 1,
    });
  }, [defaultPageSize]);

  const requestParams = useMemo(
    () => ({
      ...pageInfo,
      ...queryParams,
    }),
    [pageInfo, queryParams],
  );

  const handleRequest = useCallback(
    async (params: any) => {
      try {
        const response = await fetchData?.(params);

        if (response) {
          const { list = [], current, pageSize, total = 0 } = response;

          if (total !== undefined && total !== null && total !== 0) {
            setTotal(total);
          }

          setPageInfo((prevState) => {
            if (prevState.current === current && prevState.pageSize === pageSize) {
              return prevState;
            }
            return {
              pageSize: pageSize || defaultPageSize,
              current: current || 1,
            };
          });

          return initialOptions.length > 0
            ? [
                ...initialOptions,
                ...list.filter(
                  (item) => !initialOptions.some((option) => option.value === item.value),
                ),
              ]
            : list;
        }

        return initialOptions.length > 0 ? initialOptions : [];
      } catch (error) {
        console.error('CustomSelect 请求数据错误:', error);
        return initialOptions.length > 0 ? initialOptions : [];
      }
    },
    [fetchData, defaultPageSize, initialOptions],
  );

  const PaginationComponent = useMemo(
    () => (
      <Pagination
        size="small"
        align="end"
        hideOnSinglePage
        showSizeChanger={false}
        total={total}
        pageSize={pageInfo?.pageSize}
        current={pageInfo?.current}
        onChange={(page, pageSize) => {
          setPageInfo({
            pageSize: pageSize || defaultPageSize,
            current: page,
          });
        }}
      />
    ),
    [total, pageInfo, defaultPageSize],
  );

  const dropdownRender = useCallback(
    (menu: React.ReactNode) => (
      <>
        {menu}
        {PaginationComponent}
      </>
    ),
    [PaginationComponent],
  );

  const mergedFieldProps = useMemo(
    () => ({
      ...selectProps,
      onSearch: resetPagination,
      onFocus: resetPagination,
      dropdownRender,
      getPopupContainer:
        selectProps?.getPopupContainer || ((triggerNode) => triggerNode.parentElement),
      options:
        initialOptions.length > 0 && !selectProps?.options ? initialOptions : selectProps?.options,
    }),
    [selectProps, resetPagination, dropdownRender, initialOptions],
  );

  return (
    <ConfigProvider
      getPopupContainer={(triggerNode) => triggerNode?.parentElement || document.body}
    >
      <ProFormSelect
        {...restProps}
        fieldProps={mergedFieldProps}
        debounceTime={500}
        params={requestParams}
        request={handleRequest}
      />
    </ConfigProvider>
  );
});

export default CustomSelect;
