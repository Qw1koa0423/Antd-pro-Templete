# 🤖 AI协作开发指南

## 项目简介

这是一个基于 **Ant Design Pro** 的企业级后台管理模板，具有完善的权限管理系统和规范的代码结构。

### 🎯 项目特色

- **多环境配置**: 支持 local/alpha/beta/rc/production 环境
- **权限管理**: 基于API权限列表的细粒度权限控制
- **类型安全**: 完整的TypeScript类型定义
- **组件丰富**: 自定义上传、选择器等业务组件
- **规范完善**: 统一的代码规范和开发流程

## 🚀 如何与AI协作开发

### 1. 描述需求的最佳方式

当您需要AI帮助时，请按以下格式描述：

```markdown
## 功能需求

- **模块名称**: 商品管理
- **功能描述**: 实现商品列表查询、新增、编辑、删除功能
- **权限要求**: 需要 product:list, product:create, product:update, product:delete 权限
- **页面路由**: /product/management

## 接口需求

- GET /api/console/product/list - 获取商品列表（支持分页、搜索）
- POST /api/console/product/create - 创建商品
- PUT /api/console/product/update - 更新商品
- DELETE /api/console/product/delete - 删除商品

## UI要求

- 使用ProTable组件展示商品列表
- 支持名称、分类、价格等字段搜索
- 支持分页、排序功能
- 操作列包含查看、编辑、删除按钮
- 新增/编辑使用弹窗形式，表单包含：商品名称、分类、价格、描述等字段
```

### 2. 基于Swagger生成接口

如果您有完整的Swagger文档，可以这样请求：

```markdown
## 基于Swagger生成代码

根据 src/services/swaggerApi.json 中的接口定义，为我生成完整的用户管理模块：

**需要生成的内容:**

1. TypeScript类型定义 (`src/services/user/typings.d.ts`)
2. API接口函数 (`src/services/user/api.ts`)
3. 用户管理页面组件 (`src/pages/User/Management/index.tsx`)
4. 路由配置更新
5. 权限控制集成

**接口包括:**

- /api/console/user/list
- /api/console/user/create
- /api/console/user/update/{id}
- /api/console/user/delete/{id}
```

### 3. 组件功能增强

```markdown
## 组件增强需求

为 CustomUploadButton 组件增加以下功能：

**新增功能:**

- 图片文件的预览功能
- 支持拖拽排序
- 批量删除功能

**要求:**

- 保持现有API兼容性
- 新增相应的TypeScript类型定义
- 更新组件文档和使用示例
```

### 4. 页面模板定制

```markdown
## 页面模板需求

创建一个标准的CRUD页面模板，包含：

**功能要求:**

- 列表展示（ProTable）
- 搜索筛选
- 新增/编辑弹窗
- 批量操作
- 权限控制集成

**技术要求:**

- 使用TypeScript
- 集成项目权限系统
- 遵循项目代码规范
- 包含完整的错误处理
```

## 🛠️ AI会为您自动处理

### ✅ 自动生成内容

- [x] **TypeScript类型定义** - 完整的接口类型
- [x] **API接口函数** - 标准的request调用
- [x] **页面组件代码** - 基于Pro Components
- [x] **路由配置** - 包含权限控制
- [x] **权限集成** - 自动集成访问控制
- [x] **错误处理** - 统一的异常处理
- [x] **代码注释** - 详细的功能说明

### ✅ 遵循项目规范

- [x] **命名规范** - 文件和变量命名
- [x] **目录结构** - 标准的文件组织
- [x] **代码风格** - ESLint + Prettier
- [x] **类型安全** - 完整的TS类型
- [x] **权限控制** - 基于API权限列表

## 📋 常见开发场景

### 场景1: 全新业务模块

```
我需要创建一个订单管理模块，包含订单列表、订单详情、状态更新功能，权限控制基于 order:list, order:detail, order:update
```

**AI会生成:**

1. `src/services/order/` 目录和文件
2. 订单相关的类型定义
3. API接口函数
4. 页面组件（列表、详情、编辑）
5. 路由配置和权限设置

### 场景2: 基于现有组件扩展

```
基于 CustomSelect 组件，创建一个支持多选的 MultiSelect 组件
```

**AI会生成:**

1. 新的组件代码
2. 相关类型定义
3. 使用文档和示例
4. 单元测试（如需要）

### 场景3: API接口集成

```
根据后端提供的用户管理接口文档，生成前端对应的服务层代码
```

**AI会生成:**

1. 标准的API调用函数
2. 请求和响应类型定义
3. 错误处理机制
4. 使用示例代码

## 🎛️ 环境和命令

### 开发环境启动

```bash
# 本地开发环境
pnpm start

# 其他环境
pnpm start:alpha    # Alpha环境
pnpm start:beta     # Beta环境
pnpm start:rc       # 预发布环境
```

### 代码质量检查

```bash
pnpm run lint       # ESLint检查
pnpm run type-check # TypeScript类型检查
pnpm run prettier   # 代码格式化
```

### 构建和部署

```bash
pnpm run build      # 生产构建
pnpm run preview    # 预览构建结果
```

## 🔧 自定义配置

### 权限配置

在 `src/access.ts` 中配置权限逻辑：

```typescript
// 权限控制基于API权限列表
const apiPermissions = currentUser?.apiPermissions || [];
```

### 路由配置

在 `config/routes.ts` 中配置页面路由：

```typescript
{
  path: '/your-module',
  name: '模块名称',
  access: 'your:permission',
  component: './YourModule',
}
```

### API配置

在相应的 `services/{module}/api.ts` 中配置接口：

```typescript
export async function yourApi(params: YourType.Request) {
  return request<YourType.Response>(`${API_URL}/your/api`, {
    method: 'POST',
    data: params,
  });
}
```

## 💡 最佳实践建议

### 1. 描述需求时要具体

❌ **不好的描述**: "帮我做一个用户管理" ✅ **好的描述**: "创建用户管理模块，包含列表查询（支持姓名、邮箱搜索）、新增用户（表单包含姓名、邮箱、角色）、编辑用户、禁用用户功能，需要 user:list、user:create、user:update、user:disable 权限"

### 2. 提供完整的业务上下文

- 说明数据结构和字段
- 明确权限要求
- 描述用户交互流程
- 指出特殊业务规则

### 3. 分步骤请求

复杂功能可以分步实现：

1. 先生成基础的类型定义和API接口
2. 再生成页面组件结构
3. 最后完善交互逻辑和权限控制

### 4. 利用现有组件

优先使用项目中的自定义组件：

- `CustomUploadButton` - 文件上传
- `CustomSelect` - 下拉选择（支持分页）
- `ProTable` - 数据表格
- `ProForm` - 表单组件

## 🤝 协作流程建议

1. **需求分析** - 明确功能要求和技术细节
2. **类型优先** - 先定义数据结构和接口类型
3. **接口实现** - 生成API调用函数
4. **组件开发** - 实现页面组件和交互
5. **权限集成** - 配置访问控制
6. **测试验证** - 确保功能正常运行

通过这种协作方式，AI能够更好地理解您的需求，生成高质量的代码，让您的开发效率大大提升！ 🚀
