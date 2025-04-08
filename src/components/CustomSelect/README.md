# CustomSelect 自定义下拉选择组件

一个增强版的下拉选择组件，基于 Ant Design 的 Select 组件封装，支持分页功能、远程搜索和数据加载，适用于大数据量的选择场景。

## 功能特点

- 支持下拉列表分页查询
- 支持远程搜索
- 自动加载初始选项标签
- 可配置分页大小
- 无缝集成到 ProForm

## 安装

组件已内置在项目中，无需额外安装。

## 基本使用

### 简单的分页选择器

```tsx
import React from 'react';
import CustomSelect from '@/components/CustomSelect';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  // 模拟API请求函数
  const fetchUserList = async (params: API.PageRequest) => {
    const { current, pageSize } = params;

    // 这里替换为实际API调用
    const response = await fetch(`/api/users?current=${current}&pageSize=${pageSize}`);
    const data = await response.json();

    return {
      list: data.list.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
      total: data.total,
      current: data.current,
      pageSize: data.pageSize,
    };
  };

  return (
    <ProForm>
      <CustomSelect
        name="userId"
        label="选择用户"
        placeholder="请选择用户"
        fetchData={fetchUserList}
        defaultPageSize={10}
      />
    </ProForm>
  );
};

export default Demo;
```

### 带搜索和查询参数的选择器

```tsx
import React, { useState } from 'react';
import CustomSelect from '@/components/CustomSelect';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const [searchParams, setSearchParams] = useState({ status: 'active' });

  // 模拟API请求函数
  const fetchProductList = async (params: API.PageRequest) => {
    const { current, pageSize, keyWords } = params;

    // 这里替换为实际API调用
    const response = await fetch(
      `/api/products?current=${current}&pageSize=${pageSize}&keyWords=${keyWords || ''}&status=${searchParams.status}`,
    );
    const data = await response.json();

    return {
      list: data.list.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
      total: data.total,
      current: data.current,
      pageSize: data.pageSize,
    };
  };

  return (
    <ProForm>
      <CustomSelect
        name="productId"
        label="选择产品"
        placeholder="搜索产品名称"
        fetchData={fetchProductList}
        queryParams={searchParams}
        selectProps={{
          showSearch: true,
          filterOption: false,
        }}
        defaultPageSize={8}
      />
    </ProForm>
  );
};

export default Demo;
```

### 获取初始标签

当组件初始化时需要根据value获取对应的label文本：

```tsx
import React, { useState, useEffect } from 'react';
import CustomSelect from '@/components/CustomSelect';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  // 缓存所有部门数据
  const [departments, setDepartments] = useState<Record<string, any>>({});

  // 初始化时加载所有部门数据
  useEffect(() => {
    const loadAllDepartments = async () => {
      try {
        const response = await fetch('/api/departments/all');
        const data = await response.json();

        // 转换为id-item映射表
        const deptMap = data.reduce((acc: Record<string, any>, dept: any) => {
          acc[dept.id] = dept;
          return acc;
        }, {});

        setDepartments(deptMap);
      } catch (error) {
        console.error('加载部门数据失败:', error);
      }
    };

    loadAllDepartments();
  }, []);

  // 从缓存中获取标签
  const getLabelFromCache = async (id: string) => {
    const dept = departments[id];
    return {
      label: dept?.name || id,
      value: id,
    };
  };

  return (
    <ProForm initialValues={{ departmentId: '123' }}>
      <CustomSelect
        name="departmentId"
        label="选择部门"
        fetchData={/* 正常的分页查询函数 */}
        fetchLabelByValue={getLabelFromCache}
      />
    </ProForm>
  );
};

export default Demo;
```

### 多选模式

```tsx
import React from 'react';
import CustomSelect from '@/components/CustomSelect';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  // 模拟API请求函数
  const fetchRoleList = async (params: API.PageRequest) => {
    const { current, pageSize } = params;

    // 这里替换为实际API调用
    const response = await fetch(`/api/roles?current=${current}&pageSize=${pageSize}`);
    const data = await response.json();

    return {
      list: data.list.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
      total: data.total,
      current: data.current,
      pageSize: data.pageSize,
    };
  };

  // 根据ID获取角色名称
  const fetchRoleById = async (id: string) => {
    // 实际API调用
    const response = await fetch(`/api/roles/${id}`);
    const data = await response.json();

    return {
      label: data.name,
      value: data.id,
    };
  };

  return (
    <ProForm
      initialValues={{
        // 多选模式下的对象数组
        roleIds: [
          { label: '管理员', value: 'admin' },
          { label: '编辑', value: 'editor' },
        ],
      }}
    >
      <CustomSelect
        name="roleIds"
        label="选择角色"
        placeholder="请选择角色"
        fetchData={fetchRoleList}
        fetchLabelByValue={fetchRoleById}
        selectProps={{
          mode: 'multiple',
          maxTagCount: 3,
        }}
        defaultPageSize={8}
      />
    </ProForm>
  );
};

export default Demo;
```

### 使用对象形式的初始值

```tsx
import React from 'react';
import CustomSelect from '@/components/CustomSelect';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const fetchDepartmentList = async (params) => {
    // 实现省略
  };

  const handleSubmit = async (values) => {
    console.log('提交的值:', values);
    // departmentId将是162而不是对象
  };

  return (
    <ProForm
      initialValues={{
        departmentId: {
          label: '研发部',
          value: 162,
        },
        roleIds: [
          { label: '管理员', value: 'admin' },
          { label: '编辑', value: 'editor' },
        ],
      }}
      onFinish={handleSubmit}
    >
      {/* 单选情况 */}
      <ProForm.Item
        name="departmentId"
        label="选择部门"
        transform={(value) =>
          value && typeof value === 'object' && 'value' in value ? value.value : value
        }
      >
        <CustomSelect placeholder="请选择部门" fetchData={fetchDepartmentList} />
      </ProForm.Item>

      {/* 多选情况 */}
      <ProForm.Item
        name="roleIds"
        label="选择角色"
        transform={(values) =>
          Array.isArray(values)
            ? values.map((v) => (v && typeof v === 'object' && 'value' in v ? v.value : v))
            : values
        }
      >
        <CustomSelect
          placeholder="请选择角色"
          fetchData={fetchRoleList}
          selectProps={{
            mode: 'multiple',
          }}
        />
      </ProForm.Item>
    </ProForm>
  );
};

export default Demo;
```

## API

### 组件属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| selectProps | Select组件属性（可选） | `SelectProps` | `{}` |
| fetchData | 数据请求函数 | `(params: API.PageRequest) => Promise<API.PageResponse<any>>` | - |
| queryParams | 额外的查询参数 | `Record<string, any>` | - |
| defaultPageSize | 默认分页大小 | `number` | `8` |
| fetchLabelByValue | 根据值获取标签的函数 | `(value: any) => Promise<{ label: React.ReactNode; value: any }>` | - |

此外，组件还支持所有 ProFormSelect 的属性（除了 fieldProps 和 request）。

### API.PageRequest 类型定义

```typescript
interface PageRequest {
  current: number; // 当前页码
  pageSize: number; // 每页数量
  keyword?: string; // 搜索关键词（可选）
  [key: string]: any; // 其他参数
}
```

### API.PageResponse 类型定义

```typescript
interface PageResponse<T> {
  list: T[]; // 数据列表
  total: number; // 总记录数
  current: number; // 当前页码
  pageSize: number; // 每页数量
  [key: string]: any; // 其他参数
}
```
