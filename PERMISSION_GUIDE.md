# 🔐 权限系统配置指南

这个模板提供了灵活的权限配置方案，让您可以轻松应对有权限和无权限项目的不同需求。

## 📋 权限配置概览

### 🎛️ 权限模式选择

**1. 完整权限控制模式**

- 适用于：企业级管理系统，需要细粒度权限控制
- 特点：基于API权限列表的完整权限控制

**2. 简单权限模式**

- 适用于：小型项目，只需要基本的登录验证
- 特点：仅检查用户登录状态

**3. 无权限模式**

- 适用于：内部工具，无需权限控制的系统
- 特点：所有功能对所有用户开放

## ⚙️ 快速配置

### 方案一：修改配置文件（推荐）

编辑 `src/config/permission.ts` 文件：

```typescript
// 1. 无权限模式 - 适用于内部工具
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: false, // 🔓 禁用权限系统
  // ... 其他配置保持默认
};

// 2. 简单权限模式 - 只检查登录状态
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'simple', // 📝 仅登录验证
  FORCE_PERMISSION_IN_DEV: false,
};

// 3. 完整权限控制 - 企业级应用
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api', // 🎯 完整API权限控制
  FORCE_PERMISSION_IN_DEV: true,
};
```

### 方案二：使用预设配置

```typescript
import { applyPermissionPreset } from '@/config/permission';

// 应用预设配置
applyPermissionPreset('NO_PERMISSION'); // 无权限模式
applyPermissionPreset('SIMPLE_PERMISSION'); // 简单权限模式
applyPermissionPreset('FULL_PERMISSION'); // 完整权限模式
applyPermissionPreset('DEVELOPMENT_MODE'); // 开发模式
```

## 🎯 不同场景的具体配置

### 场景1: 内部工具/无权限项目

```typescript
// src/config/permission.ts
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: false,
  // 所有权限检查都会返回true，用户可以访问所有功能
};
```

**效果**：

- ✅ 所有按钮和页面都可以访问
- ✅ 不需要权限API接口
- ✅ 简化登录流程
- ✅ 开发和测试更方便

**路由配置**：

```typescript
// config/routes.ts - 无需access属性
{
  path: '/user',
  name: '用户管理',
  component: './User',  // 无需权限控制
},
```

**组件使用**：

```tsx
// 直接显示，无权限检查
<Button type="primary">创建用户</Button>
```

### 场景2: 简单权限项目（仅登录验证）

```typescript
// src/config/permission.ts
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'simple',
  FORCE_PERMISSION_IN_DEV: false,
};
```

**效果**：

- ✅ 检查用户登录状态
- ✅ 登录用户拥有所有功能权限
- ✅ 未登录用户重定向到登录页
- ✅ 简化权限逻辑

**路由配置**：

```typescript
// config/routes.ts - 使用简单的登录检查
{
  path: '/user',
  name: '用户管理',
  access: 'isLogin',  // 只检查登录状态
  component: './User',
},
```

**组件使用**：

```tsx
// 检查登录状态
<PermissionWrapper requireLogin>
  <Button type="primary">创建用户</Button>
</PermissionWrapper>
```

### 场景3: 企业级权限控制

```typescript
// src/config/permission.ts
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: true,
  ADMIN_PERMISSIONS: ['*', 'admin', 'admin:all'],
};
```

**效果**：

- 🎯 基于API权限列表的细粒度控制
- 🎯 支持角色和权限的复杂映射
- 🎯 完整的权限检查和错误处理
- 🎯 适合大型企业级应用

**路由配置**：

```typescript
// config/routes.ts - 完整权限控制
{
  path: '/user',
  name: '用户管理',
  access: 'apiPermission',
  accessApi: 'user:list',  // 具体的API权限
  component: './User',
},
{
  path: '/admin',
  name: '管理员',
  access: 'isAdmin',  // 管理员权限
  component: './Admin',
},
```

**组件使用**：

```tsx
// 检查具体API权限
<PermissionWrapper
  permission="user:create"
  fallback={<Button disabled>无权限</Button>}
>
  <Button type="primary">
    创建用户
  </Button>
</PermissionWrapper>

// 检查管理员权限
<PermissionWrapper requireAdmin>
  <Button danger>
    删除所有数据
  </Button>
</PermissionWrapper>
```

## 🔧 开发环境特殊配置

### 开发时禁用权限（推荐）

```typescript
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: false, // 🚧 开发时不检查权限
};
```

**好处**：

- 💻 开发时无需权限API，提升开发效率
- 💻 可以测试所有功能和界面
- 🚀 生产环境自动启用权限控制

### 开发时也启用权限

```typescript
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: true, // ⚡ 开发时也检查权限
};
```

**好处**：

- 🔒 确保开发和生产环境一致
- 🔒 提前发现权限相关问题
- 🔒 更接近真实使用场景

## 🛠️ 实际使用示例

### 1. 从有权限项目快速转为无权限

**步骤1**: 修改配置

```typescript
// src/config/permission.ts
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: false, // 一键禁用权限
};
```

**步骤2**: 清理路由（可选）

```typescript
// config/routes.ts - 移除access属性
{
  path: '/user',
  name: '用户管理',
  // access: 'apiPermission',  // 注释掉
  // accessApi: 'user:list',   // 注释掉
  component: './User',
},
```

**步骤3**: 清理组件权限检查（可选）

```tsx
// 使用forceDisablePermission临时禁用
<PermissionWrapper
  permission="user:create"
  forceDisablePermission={true}  // 强制禁用权限检查
>
  <Button>创建用户</Button>
</PermissionWrapper>

// 或者直接移除包装
<Button>创建用户</Button>
```

### 2. 从无权限项目快速升级为有权限

**步骤1**: 启用权限配置

```typescript
// src/config/permission.ts
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'simple', // 先使用简单模式
};
```

**步骤2**: 添加登录检查

```typescript
// config/routes.ts - 添加登录检查
{
  path: '/user',
  name: '用户管理',
  access: 'isLogin',  // 添加登录检查
  component: './User',
},
```

**步骤3**: 包装敏感操作

```tsx
// 包装需要权限的按钮
<PermissionWrapper requireLogin>
  <Button danger>删除用户</Button>
</PermissionWrapper>
```

**步骤4**: 逐步升级为完整权限

```typescript
// 配置升级为API权限模式
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api', // 升级为完整权限
};
```

## 📊 配置对比表

| 配置模式    | 适用场景 | 权限检查    | API需求        | 开发复杂度 |
| ----------- | -------- | ----------- | -------------- | ---------- |
| 无权限模式  | 内部工具 | ❌ 无       | 🟢 无需权限API | 🟢 简单    |
| 简单模式    | 小型项目 | 🟡 仅登录   | 🟡 基础用户API | 🟡 中等    |
| API权限模式 | 企业级   | ✅ 完整     | 🔴 完整权限API | 🔴 复杂    |
| 开发模式    | 开发阶段 | 🔄 环境切换 | 🟡 可选        | 🟢 灵活    |

## 💡 最佳实践建议

### 1. 项目初期

- 🚀 **建议使用开发模式**，开发时无权限限制
- 🚀 在核心功能完成后再配置权限系统

### 2. 权限设计

- 📝 **先确定权限粒度**：页面级 vs 功能级 vs API级
- 📝 **设计权限标识规范**：如 `module:action`

### 3. 渐进式升级

- 🔄 从 **无权限** → **简单权限** → **完整权限**
- 🔄 避免一次性实现复杂权限系统

### 4. 测试策略

- ✅ **多角色测试**：管理员、普通用户、游客
- ✅ **权限边界测试**：确保无权限用户看不到敏感功能

## 🤝 团队协作

### 前端开发者

```typescript
// 开发阶段 - 禁用权限便于开发
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: false,
};
```

### 测试人员

```typescript
// 测试阶段 - 启用权限进行测试
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'simple',
};
```

### 生产部署

```typescript
// 生产环境 - 完整权限控制
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: true,
};
```

通过这套灵活的权限配置系统，您可以轻松应对各种项目需求，从简单的内部工具到复杂的企业级系统都能游刃有余！ 🎉
