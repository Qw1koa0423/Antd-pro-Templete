# CustomUploadButton 自定义上传按钮组件

一个功能强大的文件上传组件，基于 Ant Design 的 Upload 组件进行了扩展，支持按钮和拖拽两种上传方式，并提供了更多高级功能。

## 功能特点

- 支持按钮和拖拽两种上传方式
- 支持文件类型限制
- 支持文件大小限制（单文件和总文件大小）
- 支持图片/视频尺寸限制
- 支持分块上传大文件
- 文件上传队列管理
- 自动处理上传认证信息
- 文件MD5计算

## 安装

组件已内置在项目中，无需额外安装。

## 基本使用

### 简单的文件上传按钮

```tsx
import React, { useState } from 'react';
import { Form } from 'antd';
import CustomUploadButton from '@/components/CustomUploadButton';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const [loading, setLoading] = useState(false);

  return (
    <ProForm
      submitter={{
        submitButtonProps: {
          loading,
        },
      }}
      onFinish={async (values) => {
        console.log('表单值:', values);
        return true;
      }}
    >
      <CustomUploadButton
        label="上传文件"
        name="files"
        setLoading={setLoading}
        title="点击上传"
        max={5}
        description="支持上传多个文件"
      />
    </ProForm>
  );
};

export default Demo;
```

### 文件类型和大小限制

```tsx
import React, { useState } from 'react';
import CustomUploadButton from '@/components/CustomUploadButton';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const [loading, setLoading] = useState(false);

  return (
    <ProForm>
      <CustomUploadButton
        label="上传图片"
        name="images"
        setLoading={setLoading}
        title="上传图片"
        max={3}
        allowedTypes={['image/jpeg', 'image/png', 'jpg', 'png']}
        typeErrorMessage="只允许上传JPG或PNG格式图片"
        maxFileSize={2 * 1024 * 1024}
        fileSizeErrorMessage="图片大小不能超过2MB"
        maxTotalSize={10 * 1024 * 1024}
        totalSizeErrorMessage="图片总大小不能超过10MB"
      />
    </ProForm>
  );
};

export default Demo;
```

### 图片尺寸限制

```tsx
import React, { useState } from 'react';
import CustomUploadButton from '@/components/CustomUploadButton';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const [loading, setLoading] = useState(false);

  return (
    <ProForm>
      <CustomUploadButton
        label="上传商品图片"
        name="productImage"
        setLoading={setLoading}
        title="上传商品图片"
        max={1}
        allowedTypes={['image/jpeg', 'image/png']}
        maxWidth={1920}
        maxHeight={1080}
        dimensionErrorMessage="图片尺寸不能超过1920×1080像素"
        listType="picture-card"
      />
    </ProForm>
  );
};

export default Demo;
```

### 拖拽上传

```tsx
import React, { useState } from 'react';
import CustomUploadButton from '@/components/CustomUploadButton';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const [loading, setLoading] = useState(false);

  return (
    <ProForm>
      <CustomUploadButton
        label="拖拽上传文件"
        name="documents"
        setLoading={setLoading}
        uploadType="dragger"
        title="将文件拖到此处，或点击上传"
        description="支持上传PDF、Word、Excel格式的文档"
        max={5}
        allowedTypes={[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]}
      />
    </ProForm>
  );
};

export default Demo;
```

### 大文件分块上传

```tsx
import React, { useState } from 'react';
import CustomUploadButton from '@/components/CustomUploadButton';
import { ProForm } from '@ant-design/pro-components';

const Demo = () => {
  const [loading, setLoading] = useState(false);

  return (
    <ProForm>
      <CustomUploadButton
        label="上传视频"
        name="video"
        setLoading={setLoading}
        title="上传视频"
        description="支持上传大视频文件，将自动分块上传"
        max={1}
        allowedTypes={['video/mp4', 'video/quicktime']}
        chunkUpload={true}
        fileSizeForChunk={1 * 1024 * 1024} // 5MB以上启用分块上传
        maxConcurrent={2} // 最大并发上传数量
      />
    </ProForm>
  );
};

export default Demo;
```

### 自定义回调

```tsx
import React, { useState } from 'react';
import { message } from 'antd';
import CustomUploadButton from '@/components/CustomUploadButton';
import { ProForm } from '@ant-design/pro-components';
import type { UploadFile } from 'antd/lib/upload';

const Demo = () => {
  const [loading, setLoading] = useState(false);

  const handleUploadSuccess = (file: UploadFile, response: any) => {
    message.success(`文件 ${file.name} 上传成功`);
    console.log('上传成功响应:', response);
  };

  const handleUploadError = (file: UploadFile, error: any) => {
    message.error(`文件 ${file.name} 上传失败`);
    console.error('上传失败原因:', error);
  };

  const handleFileChange = (info: any) => {
    console.log('文件列表变化:', info.fileList);
  };

  return (
    <ProForm>
      <CustomUploadButton
        label="文件上传"
        name="files"
        setLoading={setLoading}
        title="上传文件"
        max={5}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        onFileChange={handleFileChange}
      />
    </ProForm>
  );
};

export default Demo;
```

## API

### 组件属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| uploadType | 上传组件类型 | `'button' \| 'dragger'` | `'button'` |
| setLoading | 设置上传状态的函数 | `React.Dispatch<React.SetStateAction<boolean>>` | - |
| fieldProps | 上传组件属性 | `UploadProps` | - |
| maxConcurrent | 最大并发上传数量 | `number` | `3` |
| allowedTypes | 允许的文件类型 | `string[]` | - |
| typeErrorMessage | 文件类型错误提示 | `string` | `'文件类型不符合要求！'` |
| maxFileSize | 单文件大小限制（字节） | `number` | - |
| fileSizeErrorMessage | 文件大小错误提示 | `string` | `'文件大小超出限制！'` |
| maxTotalSize | 多文件大小限制（字节） | `number` | - |
| totalSizeErrorMessage | 总大小错误提示 | `string` | `'文件总大小超出限制！'` |
| maxWidth | 图片或视频最大宽度 | `number` | - |
| maxHeight | 图片或视频最大高度 | `number` | - |
| dimensionErrorMessage | 尺寸错误提示 | `string` | `'图片宽高超出限制！'` |
| chunkUpload | 是否启用分块上传 | `boolean` | `false` |
| fileSizeForChunk | 触发分块上传的文件大小阈值（字节） | `number` | `10 * 1024 * 1024` |
| onFileChange | 文件变更回调 | `(info: UploadChangeParam<UploadFile<any>>) => void` | - |
| onUploadSuccess | 上传成功回调 | `(file: UploadFile, response: any) => void` | - |
| onUploadError | 上传失败回调 | `(file: UploadFile, error: any) => void` | - |

此外，组件还支持所有 ProFormUploadButton 的属性。
