# 后台模板

## 项目结构

```bash
├── README.md
├── config
│   ├── config.local.ts # 本地 环境配置 本地调试时使用 会覆盖 config.ts 中的配置 本地环境不会提交到 git
│   ├── config.alpha.ts # alpha 环境配置 开发时使用
│   ├── config.beta.ts  # beta 环境配置 测试时使用
│   ├── config.rc.ts  # rc 环境配置 预发布时使用
│   ├── config.ts   # 生产配置
│   ├── defaultSettings.ts # 默认配置 layout 相关
│   ├── routes.ts # 开发配置
├── public # 静态资源
│   ├── favicon.ico # 网站图标
│   ├── icons # 图标
│   ├── logo.svg # logo
├── src
│   ├── components # 组件
│   ├── pages # 页面
│   ├── services # 接口 api和类型
│   ├── utils # 工具
│   ├── global.less # 全局样式
│   ├── global.tsx # 全局配置
│   ├── app.tsx # 入口文件
│   ├── access.ts # 权限控制
│   ├── manifest.json # PWA 配置
│   ├── service-worker.js # PWA 配置
│   ├── typings.d.ts # 类型声明
│   ├── requestErrorConfig.ts # 请求错误配置
├── tests # 测试
├── .editorconfig # 编辑器配置
├── .eslintignore # eslint 忽略配置
├── .eslintrc.js # eslint 配置
├── .gitignore # git 忽略配置
├── .prettierignore # prettier 忽略配置
├── .prettierrc.js # prettier 配置
├── .stylelintrc.js # stylelint 配置
├── jest.config.ts # jest 配置 用于测试
├── jsconfig.json # vscode 配置
├── package.json # 依赖
├── tsconfig.json # ts 配置
├── playwright.config.ts # playwright 配置 用于测试

```

## 项目启动

```bash
# 安装依赖
yarn

# 启动项目
yarn start  # 本地环境
yarn start:alpha # alpha 环境
yarn start:beta # beta 环境
yarn start:rc # rc 环境

# 打包项目
yarn build

```

## 项目规范

### 代码规范 【重要】

- [x] [umi-eslint](https://github.com/umijs/umi/blob/master/packages/lint/src/config/eslint/rules/recommended.ts)
- [x] [prettier](https://prettier.io/)
- [x] [umi-stylelint](https://github.com/umijs/umi/blob/master/packages/lint/src/config/stylelint/index.ts)
- [x] [husky](https://typicode.github.io/husky/#/?id=automatic-recommended)

### git 提交规范 【必须】

- [x] [commitizen](https://www.conventionalcommits.org/zh-hans/v1.0.0/#%e7%ba%a6%e5%ae%9a%e5%bc%8f%e6%8f%90%e4%ba%a4%e8%a7%84%e8%8c%83)

### 命名规范 【必须】

#### 图片命名

- [x] 图片命名使用全小写,使用英文或拼音缩写,名称间隔使用-符号,需要能体现图片的大概用途,禁止文件名和实际图片内容不符合

```bash
# 例如
 bg.jpg          //背景图片
 mod-bg.jpg      //模块背景
 sprites.png     //精灵图
 btn-start.png   //开始按钮
 ico-play.png    //修饰性图片
```

#### 页面命名(pages)

- [x] 页面命名使用全小写，多个单词用 \_ 连接,页面级组件命名使用大驼峰+Page
- [x] 当页面只有一个页面时,请在 index.tsx 中直接渲染页面
- [x] 如涉及到多个页面,请在 index.tsx 引入 Outlet 并使用 Outlet 渲染子页面

```javascript

/**
 * 例如
 * /pages/login/index.tsx
 */
import React from 'react';
const LoginPage: React.FC = () => {
  return (
    <div>
    <h1>登录页面</h1>
    </div>
  )
};

/** /pages/user/index.tsx */
import { PageContainer } from '@ant-design/pro-layout';
import { Outlet } from '@umijs/max';
import React from 'react';
const UserPage: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};
export default UserPage;
/** /pages/user/use_list.tsx */
import React from 'react';
const UserListPage: React.FC = () => {
  return <div>用户列表</div>;
};
export default UserListPage;

/** /pages/user/use_detail.tsx */
import React from 'react';
const UserDetailPage: React.FC = () => {
  return <div>用户详情</div>;
};
export default UserDetailPage;
```

#### 组件命名(components)

##### 全局组件

- [x] 全局组件命名使用大驼峰,如: GlobalHeader
- [x] 全局组件放在 src/components 目录下

##### 页面组件

- [x] 页面组件命名使用大驼峰,如: UserList
- [x] 页面组件放在 src/pages/xxx/components 目录下

#### 工具命名(utils)

- [x] 工具命名使用全小写,多个单词用 \_ 连接,如: get_signature.ts
- [x] 工具放在 src/utils 目录下,在 index.ts 中导出

#### 变量命名

- [x] 变量命名使用单个使用小写,多个单词使用小驼峰,语义化
- [x] 常量命名使用大写,多个单词用 \_ 连接,使用 const 声明。

```javascript
// 例如
import  { useState } from 'react';
const options = [];
const [userList, setUserList] = useState<User.UserListItem[]>([]);
const USER_NAME = 'admin';

```

#### 函数命名

- [x] 函数命名动词开头,如: getUserList

#### 接口命名(services)

- [x] 接口文件放在 src/services 目录下
- [x] 通用接口放在 src/services/API.d.ts 文件中
- [x] 接口按照顶级页面创建文件夹,如: src/services/user
- [x] 文件夹下创建 api.ts 文件,用于存放接口
- [x] 文件夹下创建 types.ts 文件,用于存放接口类型

```typescript
/**
 * 例如
 * /services/user/api.ts
 */
import { request } from 'umi';
/**
 * @name 获取用户列表
 * @params params
 */
export async function getUserList(params: API.PageRequest & User.UserListParams) {
  return request<API.PageInfo<User.UserListItem>>(`${API_URL}/user/list`, {
    method: 'GET',
    params,
  });
}
```

#### 类型命名(types)

- [x] 类型文件放在 src/services/xxx/typings.d.ts 文件中
- [x] 类型文件要开启命名空间,如: namespace UserType
- [x] 尽量做好注释,如: /\*_ 用户列表请求 _/

```typescript
/** /services/user/typings.d.ts */
declare namespace UserType {
  /** 用户列表请求 */
  type UserListParams = {
    keyWords?: string;
    roleName?: 0 | 1;
    startTime?: string;
    endTime?: string;
  };
  /** 用户列表返回 */
  type UserListItem = {
    keyIndex?: number;
    id: number;
    username: string;
    avatar: string;
    account: string;
    createTime: string;
    updateTime: string;
    region: string[];
    status: 0 | 1;
    roleId: number;
  };
  /** 用户 */
  type User = {
    id: number;
    username: string;
    account: string;
    password: string;
    avatar: string;
    region: number[];
    role: number[];
    createTime: string;
    updateTime: string;
  };
}
```

### 代码规范

#### 头部注释 【建议】

- [x] 每个文件都要有头部注释,注释内容包括作者,创建时间,修改人,修改时间,文件描述,如:

```bash
<!--
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-22 11:39:51
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-03-30 14:52:12
 * @FilePath: \Templete\README.md
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
-->

```

- [x] 推荐使用 vscode 插件: [koroFileHeader](https://marketplace.visualstudio.com/items?itemName=OBKoro1.korofileheader),在 settings.json 中配置如下:

```json
// 头部注释
  "fileheader.customMade": {
    // Author字段是文件的创建者 可以在specialOptions中更改特殊属性
    // 公司项目和个人项目可以配置不同的用户名与邮箱 搜索: gitconfig includeIf  比如: https://ayase.moe/2021/03/09/customized-git-config/
    // 自动提取当前git config中的: 用户名、邮箱
    "Author": "git config user.name && git config user.email", // 同时获取用户名与邮箱
    // "Author": "git config user.name", // 仅获取用户名
    // "Author": "git config user.email", // 仅获取邮箱
    // "Author": "OBKoro1", // 写死的固定值 不从git config中获取
    "Date": "Do not edit", // 文件创建时间(不变)
    // LastEditors、LastEditTime、FilePath将会自动更新 如果觉得时间更新的太频繁可以使用throttleTime(默认为1分钟)配置更改更新时间。
    "LastEditors": "git config user.name && git config user.email", // 文件最后编辑者 与Author字段一致
    // 由于编辑文件就会变更最后编辑时间，多人协作中合并的时候会导致merge
    // 可以将时间颗粒度改为周、或者月，这样冲突就减少很多。搜索变更时间格式: dateFormat
    "LastEditTime": "Do not edit", // 文件最后编辑时间
    // 输出相对路径，类似: /文件夹名称/src/index.js
    "FilePath": "Do not edit", // 文件在项目中的相对路径 自动更新
    // 插件会自动将光标移动到Description选项中 方便输入 Description字段可以在specialOptions更改
    "Description": "", // 介绍文件的作用、文件的入参、出参。
    // custom_string_obkoro1~custom_string_obkoro100都可以输出自定义信息
    // 可以设置多条自定义信息 设置个性签名、留下QQ、微信联系方式、输入空行等
    "custom_string_obkoro1": "",
    // 版权声明 保留文件所有权利 自动替换年份 获取git配置的用户名和邮箱
    // 版权声明获取git配置, 与Author字段一致: ${git_name} ${git_email} ${git_name_email}
    "custom_string_obkoro1_copyright": "Copyright (c) ${now_year} by 遥在科技, All Rights Reserved. "
    // "custom_string_obkoro1_copyright": "Copyright (c) ${now_year} by 写死的公司名/用户名, All Rights Reserved. "
  },
```

#### 代码注释 【建议】

- [x] 代码注释要做到: 代码注释与代码同步,注释要及时更新,不要出现注释与代码不一致的情况
- [x] 必要的注释要写在代码上方,如: 函数注释,变量注释。

#### vscode 配置 【建议】

- [x] vscode 配置文件: settings.json

```json
{
  "git.enableSmartCommit": true,
  // 修改注释颜色
  "editor.tokenColorCustomizations": {
    "comments": {
      "fontStyle": "italic",
      "foreground": "#fa05e2"
    }
  },
  // 配置文件类型识别
  "files.associations": {
    "*.js": "javascript",
    "*.json": "jsonc",
    "*.cjson": "jsonc",
    "*.wxss": "css",
    "*.wxs": "javascript"
  },
  "extensions.ignoreRecommendations": false,
  "files.exclude": {
    "**/.DS_Store": true,
    "**/.git": true,
    "**/.hg": true,
    "**/.svn": true,
    "**/CVS": true,
    "**/node_modules": false,
    "**/tmp": true
  },
  // "javascript.implicitProjectConfig.experimentalDecorators": true,
  "explorer.confirmDragAndDrop": false,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "git.confirmSync": false,
  "editor.fontWeight": "500",
  "[json]": {},
  "editor.tabCompletion": "on",
  "vsicons.projectDetection.autoReload": true,
  "editor.fontFamily": "Fira Code,Monaco, Courier New, monospace, Meslo LG M for Powerline",
  "editor.fontLigatures": true,
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
  "editor.fontSize": 20,
  "debug.console.fontSize": 14,
  "vsicons.dontShowNewVersionMessage": true,
  "emmet.extensionsPath": [""],
  // vue eslint start 保存时自动格式化代码
  "editor.formatOnSave": true,
  // eslint配置项，保存时自动修复错误
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "vetur.ignoreProjectWarning": true,
  // 让vetur使用vs自带的js格式化工具
  // uni-app和vue 项目使用
  "vetur.format.defaultFormatter.js": "vscode-typescript",
  "javascript.format.semicolons": "remove",
  // // 指定 *.vue 文件的格式化工具为vetur
  "[vue]": {
    "editor.defaultFormatter": "octref.vetur"
  },
  // // 指定 *.js 文件的格式化工具为vscode自带
  "[javascript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
  // // 默认使用prettier格式化支持的文件
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.BracketSameLine": true,
  "prettier.tabWidth": 4,
  "vetur.format.defaultFormatter.html": "prettier",
  // 函数前面加个空格
  "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
  "prettier.singleQuote": true,
  "prettier.semi": false,
  // eslint end
  // react
  // 当按tab键的时候，会自动提示
  "emmet.triggerExpansionOnTab": true,
  "emmet.showAbbreviationSuggestions": true,
  "emmet.includeLanguages": {
    // jsx的提示
    "javascript": "javascriptreact",
    "vue-html": "html",
    "vue": "html",
    "wxml": "html"
  },
  // end
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  // @路径提示
  "path-intellisense.mappings": {
    "@": "${workspaceRoot}/src"
  },
  "git.ignoreMissingGitWarning": true,
  "bracket-pair-colorizer-2.depreciation-notice": false,
  "security.workspace.trust.untrustedFiles": "open",
  "workbench.editorAssociations": {
    "*.ipynb": "jupyter-notebook"
  },
  "notebook.cellToolbarLocation": {
    "default": "right",
    "jupyter-notebook": "left"
  },
  "varTranslation.translationEngine": "bing",
  "gitlens.defaultDateLocale": null,
  "git.autofetch": true,
  "editor.inlineSuggest.enabled": true,
  // 头部注释
  "fileheader.customMade": {
    // Author字段是文件的创建者 可以在specialOptions中更改特殊属性
    // 公司项目和个人项目可以配置不同的用户名与邮箱 搜索: gitconfig includeIf  比如: https://ayase.moe/2021/03/09/customized-git-config/
    // 自动提取当前git config中的: 用户名、邮箱
    "Author": "git config user.name && git config user.email", // 同时获取用户名与邮箱
    // "Author": "git config user.name", // 仅获取用户名
    // "Author": "git config user.email", // 仅获取邮箱
    // "Author": "OBKoro1", // 写死的固定值 不从git config中获取
    "Date": "Do not edit", // 文件创建时间(不变)
    // LastEditors、LastEditTime、FilePath将会自动更新 如果觉得时间更新的太频繁可以使用throttleTime(默认为1分钟)配置更改更新时间。
    "LastEditors": "git config user.name && git config user.email", // 文件最后编辑者 与Author字段一致
    // 由于编辑文件就会变更最后编辑时间，多人协作中合并的时候会导致merge
    // 可以将时间颗粒度改为周、或者月，这样冲突就减少很多。搜索变更时间格式: dateFormat
    "LastEditTime": "Do not edit", // 文件最后编辑时间
    // 输出相对路径，类似: /文件夹名称/src/index.js
    "FilePath": "Do not edit", // 文件在项目中的相对路径 自动更新
    // 插件会自动将光标移动到Description选项中 方便输入 Description字段可以在specialOptions更改
    "Description": "", // 介绍文件的作用、文件的入参、出参。
    // custom_string_obkoro1~custom_string_obkoro100都可以输出自定义信息
    // 可以设置多条自定义信息 设置个性签名、留下QQ、微信联系方式、输入空行等
    "custom_string_obkoro1": "",
    // 版权声明 保留文件所有权利 自动替换年份 获取git配置的用户名和邮箱
    // 版权声明获取git配置, 与Author字段一致: ${git_name} ${git_email} ${git_name_email}
    "custom_string_obkoro1_copyright": "Copyright (c) ${now_year} by 遥在科技, All Rights Reserved. "
    // "custom_string_obkoro1_copyright": "Copyright (c) ${now_year} by 写死的公司名/用户名, All Rights Reserved. "
  },
  // 函数注释
  "fileheader.cursorMode": {
    "description": "", // 函数注释生成之后，光标移动到这里
    "param": "", // param 开启函数参数自动提取 需要将光标放在函数行或者函数上方的空白行
    "return": ""
  },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "explorer.confirmDelete": false,
  "minapp-vscode.disableAutoConfig": true,
  "search.collapseResults": "auto",
  "background.useDefault": false,
  "liveServer.settings.donotShowInfoMsg": true,
  "terminal.integrated.fontWeightBold": "bold",
  "files.autoSaveDelay": 5000,
  "files.autoSave": "afterDelay",
  "workbench.iconTheme": "vscode-icons",
  "tailwindCSS.experimental.classRegex": [],
  "tailwindCSS.emmetCompletions": true,
  "diffEditor.ignoreTrimWhitespace": false,
  "window.zoomLevel": 1,
  "editor.unicodeHighlight.allowedCharacters": {
    "ｐ": true
  },
  "window.commandCenter": true,
  "workbench.colorTheme": "Noctis Lux"
}
```

#### CI

自行添加 ci 文件
