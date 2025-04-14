# Umi权限管理方案

本项目基于Umi的access插件实现了一套基于API权限列表的权限管理方案。

## 1. 权限控制原理

Umi的权限控制主要通过以下几个部分实现：

- **access.ts**：定义权限判断逻辑
- **路由权限**：在路由配置中使用access属性控制访问权限
- **组件权限**：在组件中使用`useAccess`和`<Access />`组件控制UI元素的显示

## 2. 权限数据来源

本项目的权限数据来源于后端返回的API权限列表：

1. 用户登录后，前端调用`getApiAuth`接口获取用户的API权限列表
2. 将API权限列表保存在用户信息中
3. 通过`access.ts`中的逻辑，基于API权限列表判断用户的各种权限

## 3. 权限判断逻辑

在`access.ts`中，我们定义了以下权限判断逻辑：

```typescript
export default function access(initialState: {
  currentUser?: AccountType.LoginResponse & { username: string };
}) {
  const { currentUser } = initialState || {};
  // 获取用户的API权限列表
  const apiPermissions = currentUser?.apiPermissions || [];

  // 判断是否有管理员权限（基于API权限列表）
  const hasAdminPermission = apiPermissions.some(
    (permission) => permission.includes('admin:') || permission === 'admin',
  );

  return {
    // 是否登录
    isLogin: !!currentUser,

    // 管理员权限
    isAdmin: hasAdminPermission,

    // 路由访问权限
    routeFilter: (route) => {
      /* ... */
    },

    // API权限检查
    canAccess: (apiKey) => {
      /* ... */
    },
  };
}
```

## 4. 路由权限控制

在路由配置中，可以通过两种方式控制路由访问权限：

1. **基于角色**：使用`access`属性，对应`access.ts`中定义的权限名称

   ```typescript
   {
     path: '/admin',
     name: '管理员页面',
     access: 'isAdmin', // 需要管理员权限
     component: './Admin',
   }
   ```

2. **基于API权限**：使用`accessApi`属性，指定所需的API权限
   ```typescript
   {
     path: '/api-auth',
     name: 'API权限页面',
     accessApi: 'user:read', // 需要user:read权限
     component: './ApiAuth',
   }
   ```

## 5. 组件权限控制

在组件中可以使用以下方式控制UI元素的显示：

```tsx
import { useAccess, Access } from '@umijs/max';

// 获取权限定义
const access = useAccess();

// 基于权限控制UI元素显示
<Access
  accessible={access.isAdmin}
  fallback={<Button disabled>无权限</Button>}
>
  <Button type="primary">管理员操作</Button>
</Access>

// API权限控制
<Access
  accessible={access.canAccess('user:create')}
  fallback={<Button disabled>无权限</Button>}
>
  <Button type="primary">创建用户</Button>
</Access>
```

## 6. 实际应用示例

本项目中实现了以下权限控制示例：

1. 基于管理员权限的路由控制
2. 基于登录状态的路由控制
3. 基于具体API权限的路由控制
4. 组件级别的权限控制

## 7. 添加新的权限控制

如需添加新的权限控制逻辑，可以按照以下步骤：

1. 在`access.ts`中添加新的权限判断函数
2. 在路由配置中使用相应的权限属性
3. 在组件中使用`useAccess`和`<Access />`组件控制UI元素的显示

## 8. 权限管理最佳实践

1. **最小权限原则**：用户只能看到和使用他们有权限的功能
2. **权限检查层次**：同时在路由和组件层面进行权限控制
3. **优雅降级**：当用户没有权限时，提供友好的提示或替代UI
4. **权限缓存**：减少频繁的权限检查，提高性能
