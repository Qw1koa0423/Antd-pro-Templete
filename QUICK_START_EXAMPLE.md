# 🚀 快速开始实例

## 实际开发示例：创建商品管理模块

假设您需要为电商后台创建一个商品管理功能，以下是完整的开发示例。

## 📋 需求描述（提供给AI）

```markdown
## 功能需求

- **模块名称**: 商品管理
- **功能描述**: 实现商品列表查询、新增商品、编辑商品、删除商品功能
- **权限要求**: 需要 product:list, product:create, product:update, product:delete 权限
- **页面路由**: /product/management

## 接口需求

- GET /api/console/product/list - 获取商品列表（支持分页、搜索）
- POST /api/console/product/create - 创建商品
- PUT /api/console/product/update - 更新商品
- DELETE /api/console/product/delete - 删除商品

## 数据结构

商品字段包含：

- id: number - 商品ID
- name: string - 商品名称
- category: string - 商品分类
- price: number - 商品价格
- stock: number - 库存数量
- status: number - 状态(1-上架, 0-下架)
- description: string - 商品描述
- images: string[] - 商品图片
- createTime: string - 创建时间
- updateTime: string - 更新时间

## UI要求

- 使用ProTable组件展示商品列表
- 支持商品名称、分类搜索
- 支持分页、排序功能
- 操作列包含查看、编辑、删除、上架/下架按钮
- 新增/编辑使用弹窗形式，表单包含所有字段
- 商品图片上传使用CustomUploadButton组件
```

## 🎯 AI会自动生成的代码结构

### 1. 类型定义文件

**位置**: `src/services/product/typings.d.ts`

```typescript
/*
 * @Author: 您的名字 您的邮箱
 * @Date: 2024-01-01 00:00:00
 * @Description: 商品管理相关类型定义
 */
declare namespace ProductType {
  /** 商品列表请求参数 */
  type ProductListParams = {
    current?: number;
    pageSize?: number;
    name?: string;
    category?: string;
  };

  /** 商品信息 */
  type ProductItem = {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: number;
    description: string;
    images: string[];
    createTime: string;
    updateTime: string;
  };

  /** 商品列表响应 */
  type ProductListResponse = {
    list: ProductItem[];
    total: number;
    current: number;
    pageSize: number;
  };

  /** 创建商品请求 */
  type CreateProductParams = Omit<ProductItem, 'id' | 'createTime' | 'updateTime'>;

  /** 更新商品请求 */
  type UpdateProductParams = Partial<CreateProductParams> & {
    id: number;
  };

  /** 删除商品请求 */
  type DeleteProductParams = {
    id: number;
  };
}
```

### 2. API接口文件

**位置**: `src/services/product/api.ts`

```typescript
/*
 * @Author: 您的名字 您的邮箱
 * @Date: 2024-01-01 00:00:00
 * @Description: 商品管理API接口
 */
import { request } from '@umijs/max';

/**
 * @name 获取商品列表
 * @description 支持分页和搜索的商品列表查询
 */
export async function getProductList(params: ProductType.ProductListParams) {
  return request<ProductType.ProductListResponse>(`${API_URL}/product/list`, {
    method: 'GET',
    params,
  });
}

/**
 * @name 创建商品
 * @description 创建新的商品信息
 */
export async function createProduct(params: ProductType.CreateProductParams) {
  return request<ProductType.ProductItem>(`${API_URL}/product/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/**
 * @name 更新商品
 * @description 更新商品信息
 */
export async function updateProduct(params: ProductType.UpdateProductParams) {
  return request<ProductType.ProductItem>(`${API_URL}/product/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/**
 * @name 删除商品
 * @description 删除指定商品
 */
export async function deleteProduct(params: ProductType.DeleteProductParams) {
  return request<void>(`${API_URL}/product/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/**
 * @name 更新商品状态
 * @description 上架/下架商品
 */
export async function updateProductStatus(params: { id: number; status: number }) {
  return request<void>(`${API_URL}/product/updateStatus`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}
```

### 3. 页面组件

**位置**: `src/pages/Product/Management/index.tsx`

```typescript
/*
 * @Author: 您的名字 您的邮箱
 * @Date: 2024-01-01 00:00:00
 * @Description: 商品管理页面
 */
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { useAccess, Access } from '@umijs/max';
import { Button, message, Popconfirm, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { getProductList, deleteProduct, updateProductStatus } from '@/services/product/api';
import ProductFormModal from './components/ProductFormModal';

const ProductManagementPage: React.FC = () => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ProductType.ProductItem>();

  // 删除商品
  const handleDelete = async (record: ProductType.ProductItem) => {
    try {
      await deleteProduct({ id: record.id });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 更新商品状态
  const handleStatusChange = async (record: ProductType.ProductItem) => {
    try {
      const newStatus = record.status === 1 ? 0 : 1;
      await updateProductStatus({ id: record.id, status: newStatus });
      message.success(newStatus === 1 ? '上架成功' : '下架成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 表格列定义
  const columns: ProColumns<ProductType.ProductItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '商品分类',
      dataIndex: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      search: false,
      render: (_, record) => `¥${record.price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      search: false,
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'green' : 'red'}>
          {record.status === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      search: false,
      width: 180,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Access
          key="edit"
          accessible={access.canAccess('product:update')}
        >
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </Button>
        </Access>,
        <Access
          key="status"
          accessible={access.canAccess('product:update')}
        >
          <Button
            type="link"
            onClick={() => handleStatusChange(record)}
          >
            {record.status === 1 ? '下架' : '上架'}
          </Button>
        </Access>,
        <Access
          key="delete"
          accessible={access.canAccess('product:delete')}
        >
          <Popconfirm
            title="确定删除这个商品吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Access>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: '商品管理',
      }}
    >
      <ProTable<ProductType.ProductItem>
        headerTitle="商品列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Access
            key="create"
            accessible={access.canAccess('product:create')}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              新增商品
            </Button>
          </Access>,
        ]}
        request={async (params) => {
          const response = await getProductList({
            current: params.current,
            pageSize: params.pageSize,
            name: params.name,
            category: params.category,
          });

          return {
            data: response.list,
            success: true,
            total: response.total,
          };
        }}
        columns={columns}
      />

      {/* 新增商品弹窗 */}
      <ProductFormModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        }}
        title="新增商品"
      />

      {/* 编辑商品弹窗 */}
      <ProductFormModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCurrentRecord(undefined);
        }}
        onSuccess={() => {
          setEditModalVisible(false);
          setCurrentRecord(undefined);
          actionRef.current?.reload();
        }}
        title="编辑商品"
        initialValues={currentRecord}
      />
    </PageContainer>
  );
};

export default ProductManagementPage;
```

### 4. 路由配置

**在 `config/routes.ts` 中添加**:

```typescript
{
  path: '/product',
  name: '商品管理',
  icon: 'ShoppingOutlined',
  routes: [
    {
      path: '/product',
      redirect: '/product/management',
    },
    {
      path: '/product/management',
      name: '商品管理',
      access: 'apiPermission',
      accessApi: 'product:list',
      component: './Product/Management',
    },
  ],
},
```

## 🎮 如何使用这些文档与AI协作

### 1. 告诉AI这是什么项目

```
这是一个基于Ant Design Pro的企业级后台管理模板项目，请阅读我提供的 AI_COLLABORATION_GUIDE.md 和 PROJECT_ARCHITECTURE.md 文件，了解项目结构和开发规范。
```

### 2. 提供具体需求

```
根据快速开始文档中的商品管理示例，为我创建一个用户管理模块，包含用户列表、新增用户、编辑用户、禁用/启用用户功能。权限要求：user:list, user:create, user:update, user:disable
```

### 3. 基于Swagger生成

```
根据 src/services/swaggerApi.json 文件，为 /api/console/order 相关的接口生成完整的订单管理代码，包括类型定义、API接口、页面组件和路由配置。
```

### 4. 增强现有组件

```
为 CustomUploadButton 组件增加图片预览功能，要求保持现有API兼容性，新增预览相关的props。
```

## 🎯 期望的AI响应

当您按照上述格式提需求时，AI应该：

1. **自动分析需求** - 理解业务逻辑和技术要求
2. **生成完整代码** - 类型定义、API接口、页面组件、路由配置
3. **集成权限控制** - 自动添加权限相关的代码
4. **遵循项目规范** - 按照命名规范和代码风格
5. **包含错误处理** - 统一的异常处理机制
6. **提供使用说明** - 如何使用和测试生成的代码

通过这种方式，您可以快速生成高质量、符合项目规范的代码，大大提升开发效率！ 🚀
