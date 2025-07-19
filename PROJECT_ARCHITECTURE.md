# 🏗️ 项目架构总览

## 核心信息速览

### 🎯 项目定位

**企业级后台管理模板** - 基于 Ant Design Pro 的现代化管理系统

### 🔧 技术架构

```
React 18 + TypeScript + UMI 4.x + Ant Design Pro
├── 状态管理: UMI 内置 initialState
├── 路由管理: UMI 约定式路由 + 配置路由
├── 权限控制: 基于API权限列表的细粒度控制
├── 请求处理: Axios + 统一拦截器
├── 构建工具: UMI Max + ESBuild
└── 包管理器: pnpm
```

## 📁 关键目录结构

```
Antd-pro-Templete/
├── config/                    # UMI配置文件
│   ├── config.ts             # 生产环境配置
│   ├── config.{env}.ts       # 各环境配置(alpha/beta/rc)
│   ├── defaultSettings.ts    # 默认布局配置
│   └── routes.ts             # 路由配置
├── src/
│   ├── access.ts             # 🔑 权限控制核心
│   ├── app.tsx               # 🚪 应用入口配置
│   ├── requestErrorConfig.ts # 🌐 请求配置和错误处理
│   ├── components/           # 🧩 全局组件
│   │   ├── CustomUploadButton/ # 文件上传(支持分片)
│   │   ├── CustomSelect/       # 分页选择器
│   │   └── RightContent/       # 头部用户信息
│   ├── pages/               # 📄 页面组件
│   │   ├── Login/           # 登录页
│   │   ├── Home/            # 首页(权限演示)
│   │   ├── Admin/           # 管理员页面
│   │   └── List/            # 各种列表页面
│   ├── services/            # 🔌 API服务层
│   │   ├── account/         # 账户相关API
│   │   ├── common/          # 通用API
│   │   ├── typings.d.ts     # 全局类型定义
│   │   └── swaggerApi.json  # 📋 Swagger规范文件
│   └── utils/               # 🛠️ 工具函数
│       ├── upload.ts        # 上传工具
│       ├── signature.tsx    # 签名工具
│       └── dealwithfile.ts  # 文件处理
└── .cursor/rules/           # 🤖 Cursor AI规则
```

## 🔐 权限系统架构

### 核心特色: API权限列表驱动

```typescript
// 权限数据流
User Login → API返回权限列表 → 存储到用户信息 → 权限判断

// 权限控制层次
1. 路由级权限: config/routes.ts 中的 access 属性
2. 组件级权限: <Access /> 组件包裹
3. 功能级权限: access.canAccess('api:key') 判断
```

### 权限配置示例

```typescript
// 路由权限
{
  path: '/admin',
  access: 'isAdmin',        // 基于角色
  component: './Admin',
}

// API权限
{
  path: '/api-auth',
  access: 'apiPermission',  // 基于API权限列表
  accessApi: 'user:read',   // 具体权限标识
  component: './ApiAuth',
}
```

## 🌐 请求处理架构

### 统一响应格式

```typescript
// 后端响应格式
{
  code: number,  // 0=成功, 其他=失败
  msg: string,   // 错误信息
  data: any      // 实际业务数据
}

// 前端处理后直接返回 data，无需 .data.data 访问
const result = await api();  // 直接得到业务数据
```

### 请求拦截器功能

- ✅ 自动添加认证Token
- ✅ 统一错误处理(401登录失效/403无权限等)
- ✅ 业务码处理(code !== 0)
- ✅ 响应数据扁平化(直接返回data字段)

## 🎨 组件体系

### 自定义业务组件

1. **CustomUploadButton**

   - 支持分片上传大文件
   - MD5校验和进度显示
   - 拖拽上传
   - 文件类型和大小限制

2. **CustomSelect**

   - 支持分页的下拉选择
   - 远程搜索
   - 自动加载标签

3. **权限组件**
   - Access组件进行UI权限控制
   - 与业务权限系统深度集成

### Pro Components使用

- ProTable: 高级表格组件
- ProForm: 表单组件
- PageContainer: 页面容器
- ProLayout: 布局组件

## 🔄 开发流程

### 标准开发步骤

1. **需求分析** → 确定模块和权限
2. **类型定义** → 创建 TypeScript 类型
3. **API接口** → 实现服务层调用
4. **页面组件** → 开发UI交互
5. **路由配置** → 配置访问路径
6. **权限集成** → 集成权限控制
7. **测试验证** → 功能和权限测试

### 文件组织规范

```typescript
// 新业务模块创建步骤
src/services/{module}/
├── api.ts          // API接口函数
└── typings.d.ts    // 类型定义

src/pages/{Module}/
└── index.tsx       // 页面组件

config/routes.ts    // 添加路由配置
```

## 🚀 环境配置

### 多环境支持

```bash
# 5个环境配置
local      # 本地开发 (config.local.ts)
alpha      # 开发环境 (config.alpha.ts)
beta       # 测试环境 (config.beta.ts)
rc         # 预发布 (config.rc.ts)
production # 生产环境 (config.ts)
```

### 启动命令

```bash
pnpm start           # 本地环境
pnpm start:alpha     # Alpha环境
pnpm start:beta      # Beta环境
pnpm start:rc        # 预发布环境
pnpm run build       # 生产构建
```

## 🎯 项目亮点

### 1. 先进权限系统

- API权限列表驱动
- 细粒度权限控制
- 动态权限加载

### 2. 现代化技术栈

- React 18 + TypeScript
- UMI 4.x 框架
- Pro Components 组件库
- ESBuild 快速构建

### 3. 完善的开发体验

- 热更新 + 快速构建
- 代码规范 + 类型检查
- 错误处理 + 统一拦截
- 多环境 + 一键部署

### 4. 企业级特性

- 权限管理完善
- 文件上传高级功能
- 响应式布局
- PWA支持

## 🤖 AI协作要点

### 理解要点

1. **权限优先**: 所有功能都需要考虑权限控制
2. **类型安全**: 完整的 TypeScript 类型定义
3. **组件复用**: 优先使用现有自定义组件
4. **规范遵循**: 按照项目命名和代码规范

### 生成代码时确保

- [ ] TypeScript类型完整
- [ ] 权限控制集成
- [ ] 错误处理完善
- [ ] 组件导入正确
- [ ] 遵循命名规范
- [ ] 注释信息完整

这个项目为企业级后台管理系统提供了一个完整、现代化的解决方案，特别适合需要复杂权限控制的业务场景。
