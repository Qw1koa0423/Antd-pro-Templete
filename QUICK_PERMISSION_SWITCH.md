# ⚡ 快速权限切换指南

## 🎯 一分钟搞定权限配置

### 📋 三种权限模式对比

| 模式                | 适用场景           | 配置复杂度 | 功能限制      |
| ------------------- | ------------------ | ---------- | ------------- |
| 🔓 **无权限模式**   | 内部工具、原型系统 | ✅ 超简单  | ❌ 无限制     |
| 🔐 **简单权限模式** | 小型项目           | ✅ 简单    | 🟡 仅登录检查 |
| 🎯 **完整权限模式** | 企业级系统         | 🔴 复杂    | ✅ 完整控制   |

## ⚙️ 一键切换配置

### 方案1: 修改配置文件 `src/config/permission.ts`

```typescript
// 🔓 无权限模式 - 所有功能开放
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: false,
};

// 🔐 简单权限模式 - 仅检查登录
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'simple',
};

// 🎯 完整权限模式 - 企业级控制
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: true,
};
```

### 方案2: 使用预设配置

```typescript
import { applyPermissionPreset } from '@/config/permission';

// 在应用启动前应用预设
applyPermissionPreset('NO_PERMISSION'); // 🔓 无权限
applyPermissionPreset('SIMPLE_PERMISSION'); // 🔐 简单权限
applyPermissionPreset('FULL_PERMISSION'); // 🎯 完整权限
applyPermissionPreset('DEVELOPMENT_MODE'); // 🚧 开发模式
```

## 🚀 不同需求的推荐配置

### 🛠️ 开发阶段（推荐）

```typescript
// 开发时禁用权限，生产时启用
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: false, // 🔑 关键配置
};
```

**优点**: 开发效率高，生产环境安全

### 🏢 内部工具

```typescript
// 完全禁用权限系统
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: false,
};
```

**优点**: 配置最简单，无需权限API

### 📱 小型项目

```typescript
// 仅需要登录验证
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'simple',
};
```

**优点**: 配置简单，基础权限控制

### 🏭 企业级项目

```typescript
// 完整的权限控制系统
export const PERMISSION_CONFIG = {
  ENABLE_PERMISSION: true,
  PERMISSION_MODE: 'api',
  FORCE_PERMISSION_IN_DEV: true,
};
```

**优点**: 功能完整，安全性高

## 🔄 项目迁移场景

### 从有权限 → 无权限

```typescript
// 1. 修改配置（一行搞定）
ENABLE_PERMISSION: false

// 2. 可选：使用强制禁用（组件级）
<PermissionWrapper
  forceDisablePermission={true}
  permission="user:create"
>
  <Button>创建用户</Button>
</PermissionWrapper>
```

### 从无权限 → 有权限

```typescript
// 1. 启用权限配置
ENABLE_PERMISSION: true
PERMISSION_MODE: 'simple'  // 先用简单模式

// 2. 包装敏感操作
<PermissionWrapper requireLogin>
  <Button danger>删除数据</Button>
</PermissionWrapper>

// 3. 添加路由权限
{
  path: '/admin',
  access: 'isLogin',  // 添加权限检查
  component: './Admin',
}
```

## 📊 权限组件使用速查

### PermissionWrapper 组件

```tsx
// 🔓 检查API权限
<PermissionWrapper permission="user:create">
  <Button>创建用户</Button>
</PermissionWrapper>

// 🔐 检查登录状态
<PermissionWrapper requireLogin>
  <Button>需要登录</Button>
</PermissionWrapper>

// 👑 检查管理员权限
<PermissionWrapper requireAdmin>
  <Button>管理员功能</Button>
</PermissionWrapper>

// 🚫 带回退UI
<PermissionWrapper
  permission="user:delete"
  fallback={<Button disabled>无权限</Button>}
>
  <Button danger>删除用户</Button>
</PermissionWrapper>

// 🔧 强制禁用权限（调试用）
<PermissionWrapper
  permission="user:create"
  forceDisablePermission={true}
>
  <Button>测试按钮</Button>
</PermissionWrapper>
```

### usePermission Hook

```tsx
const { hasPermission, isAdmin, isLoggedIn, isPermissionEnabled } = usePermission();

// 条件渲染
{
  hasPermission('user:create') && <CreateButton />;
}

// 权限检查
const canDelete = isAdmin() || hasPermission('user:delete');

// 权限状态
if (!isPermissionEnabled) {
  // 权限系统已禁用
}
```

## 🎯 最佳实践建议

### ✅ 推荐做法

1. **开发阶段**: 使用 `DEVELOPMENT_MODE` 预设
2. **渐进升级**: 无权限 → 简单权限 → 完整权限
3. **组件包装**: 使用 `PermissionWrapper` 便于后续权限控制
4. **白名单设计**: 合理设置不需要权限的页面

### ❌ 避免的做法

1. **一开始就使用复杂权限**: 增加开发难度
2. **混合权限检查方式**: 保持一致的权限控制方式
3. **硬编码权限逻辑**: 使用配置化的权限系统

## 🚨 常见问题

### Q: 如何在开发时临时禁用权限？

```typescript
// 方案1: 修改全局配置
FORCE_PERMISSION_IN_DEV: false

// 方案2: 组件级禁用
<PermissionWrapper forceDisablePermission={true}>
```

### Q: 如何快速从企业版降级为简化版？

```typescript
// 一键切换为简单模式
applyPermissionPreset('SIMPLE_PERMISSION');
```

### Q: 如何调试权限问题？

```typescript
// 开发工具中查看权限状态
const { access, isPermissionEnabled } = usePermission();
console.log('权限状态:', { access, isPermissionEnabled });
```

---

**💡 小贴士**: 建议从最简单的配置开始，根据项目需求逐步增加权限控制的复杂度。这样既能快速开发，又能保证最终的安全性。
