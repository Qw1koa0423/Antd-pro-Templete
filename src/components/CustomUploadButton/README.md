# CustomUploadButton 自定义上传按钮组件

一个功能强大的文件上传组件，基于 Ant Design 的 Upload 组件进行了扩展，支持按钮和拖拽两种上传方式，并提供了更多高级功能。

## 功能特点

- 支持按钮和拖拽两种上传方式
- 支持文件类型限制
- 支持文件大小限制（单文件和总文件大小）
- 支持图片/视频尺寸限制
- 支持分块上传大文件
  - 可配置分块大小
  - 支持多分块并发上传
  - 提供详细的性能统计
- 文件上传队列管理
- 自动处理上传认证信息
- 文件MD5计算和性能分析
  - 小文件同步计算MD5
  - 大文件使用临时ID上传，后台异步计算MD5
- 基于文件大小的智能分片策略

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
        fileSizeForChunk={2 * 1024 * 1024} // 2MB以上启用分块上传
        concurrentChunks={5} // 5个并发上传分块
        maxConcurrent={6} // 最大并发上传数量
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
| chunkSize | 分块大小（字节） | `number` | `10 * 1024 * 1024` |
| concurrentChunks | 并发上传分块数量 | `number` | `3` |
| onFileChange | 文件变更回调 | `(info: UploadChangeParam<UploadFile<any>>) => void` | - |
| onUploadSuccess | 上传成功回调 | `(file: UploadFile, response: any) => void` | - |
| onUploadError | 上传失败回调 | `(file: UploadFile, error: any) => void` | - |

另外，组件继承了 ProFormUploadButton 或 ProFormUploadDragger 的所有属性。

## 分块上传性能优化

组件内置了详细的性能统计功能，可以在控制台查看各阶段的耗时和速度。通过这些数据可以帮助调整最佳的分块大小和并发数量。

## MD5计算优化

组件对MD5计算进行了优化，采用不同文件大小的处理策略：

1. **小文件（<256MB）**：

   - 同步计算完整MD5，等待计算完成后再上传
   - 适合在本地快速处理的中小型文件

2. **大文件（>256MB）**：
   - 先计算文件第一个分块的MD5值（分块大小与上传分片一致）
   - 使用第一个分块的MD5作为临时ID
   - 立即开始上传，不等待完整MD5计算
   - 在后台并行计算完整文件MD5
   - 确保上传完成后文件对象中包含准确的完整MD5值

这种策略可以显著提高大文件的上传速度，特别是在网络快、CPU慢的环境下，避免MD5计算成为上传的瓶颈。无论使用哪种策略，返回的文件对象中的MD5值始终是完整的文件MD5。

为了保证文件链接的一致性，对于同一个文件的上传，临时ID始终相同，确保生成的文件URL稳定可靠。

## 分片上传性能优化

组件使用的分片策略和MD5计算策略保持一致，根据文件大小自动确定最佳分片大小：

| 文件大小范围 | 分片大小 | 说明                                 |
| ------------ | -------- | ------------------------------------ |
| 0-5MB        | 不分片   | 小文件直接上传                       |
| 5-20MB       | 1MB      | 小分片以确保快速上传                 |
| 20-50MB      | 2MB      | 适中的分片大小                       |
| 50-100MB     | 4MB      | 增加分片大小以减少分片数量           |
| 100-200MB    | 6MB      | 针对较大文件优化                     |
| 200-500MB    | 10MB     | 显著增加分片大小以减少分片数量       |
| >500MB       | 20MB     | 对于超大文件使用大分片以平衡上传效率 |

### 性能统计输出示例

```
[性能统计-开始] 文件: video.mp4, 大小: 1536.45MB, 开始上传处理
[MD5性能统计] 生成前256MB临时MD5耗时: 0.542秒, 临时MD5: a8f5e7d32c1b9d0e6f4
[性能统计] 使用临时ID进行上传: a8f5e7d32c1b9d0e6f4，MD5计算将在后台继续进行
[MD5性能统计] 开始计算完整文件MD5...
[MD5性能统计] 完整文件分块处理，共6个分块，每块大小: 256.00MB
[性能统计] 开始初始化分块上传，文件大小: 1536.45MB, 分片大小: 16.00MB, 并发数: 5
[性能统计] 分块上传初始化成功: upload123, 耗时: 0.35秒
[性能统计] 文件分割完成，共96个分块, 耗时: 0.12秒
[性能统计] 开始上传分块，时间: 17:05:38
[性能统计] 分块 1/96 上传完成，耗时: 0.87秒, 速度: 18.39MB/s
...
[MD5性能统计] 分块 1/6 处理完成，大小: 256.00MB, 耗时: 1.56秒, 速度: 164.10MB/s
...
[性能统计] 所有分块上传完成，总耗时: 76.54秒, 平均速度: 20.07MB/s
[性能统计] 分块上传详细统计:
    - 平均耗时: 0.92秒/块
    - 最大耗时: 2.34秒
    - 最小耗时: 0.65秒
    - 平均速度: 17.39MB/s
[性能统计] 开始合并分块，总数: 96
[性能统计] 分块合并完成，耗时: 1.25秒
[MD5性能统计] 完整文件MD5计算完成: 7e9a8b6c5d4f3e2a1b0, 耗时: 8.45秒, 总时间: 9.12秒, 速度: 181.83MB/s
[性能统计] 等待MD5计算完成...
[性能统计] MD5计算已完成: 7e9a8b6c5d4f3e2a1b0, 耗时: 0.02秒
[性能统计-完成] 文件: video.mp4 上传完成，总耗时: 83.49秒，详细耗时:
    - MD5计算: 后台计算耗时: 0.02秒
    - 分块上传: 76.54秒 (91.67%)
    - 分块合并: 1.25秒 (1.50%)
    - 其他操作: 5.68秒
    - 总传输速度: 18.40MB/s
```

### 如何优化分块上传性能

1. **调整分块大小（chunkSize）**：

   - 较小的分块（如2MB-5MB）适合网络不稳定的环境，减少单个请求失败的影响
   - 较大的分块（如16MB-32MB）适合高速稳定的网络，减少请求次数和合并操作
   - 非常大的文件（>1GB）可能需要较小的分块以避免浏览器内存问题

2. **调整并发数量（concurrentChunks）**：

   - 高带宽环境可以设置更高的并发数（5-10），提高总体上传速度
   - 低带宽环境建议使用较低的并发数（2-3），避免网络拥塞
   - 移动设备上建议降低并发数，减少资源占用

3. **调整触发阈值（fileSizeForChunk）**：

   - 小于阈值的文件会使用普通上传，大于阈值的文件会使用分块上传
   - 根据应用场景和网络环境设置合适的阈值（通常为2MB-10MB）

4. **MD5计算策略优化**：
   - 默认使用前256MB计算临时MD5，这个大小适合大多数场景
   - 对于超大文件可以进一步优化MD5计算，降低对CPU的占用
   - 在网络性能好但CPU性能较弱的环境中，这种策略可以显著提高上传速度

## 最佳实践配置示例

### 大文件上传（高速网络）

```tsx
<CustomUploadButton
  chunkUpload={true}
  fileSizeForChunk={5 * 1024 * 1024} // 5MB以上使用分块
  chunkSize={16 * 1024 * 1024} // 16MB分块
  concurrentChunks={5} // 5个并发分块
  maxConcurrent={2} // 2个并发文件
/>
```

### 大文件上传（低速或不稳定网络）

```tsx
<CustomUploadButton
  chunkUpload={true}
  fileSizeForChunk={2 * 1024 * 1024} // 2MB以上使用分块
  chunkSize={4 * 1024 * 1024} // 4MB分块
  concurrentChunks={3} // 3个并发分块
  maxConcurrent={1} // 1个并发文件
/>
```

### 超大文件上传

```tsx
<CustomUploadButton
  chunkUpload={true}
  fileSizeForChunk={10 * 1024 * 1024} // 10MB以上使用分块
  chunkSize={8 * 1024 * 1024} // 8MB分块
  concurrentChunks={8} // 8个并发分块
  maxConcurrent={1} // 1个并发文件
/>
```

## 基于文件大小的智能分片策略

组件会根据文件大小自动确定最佳分片大小：

| 文件大小范围 | 分片大小 | 说明                                 |
| ------------ | -------- | ------------------------------------ |
| 0-5MB        | 不分片   | 小文件直接上传                       |
| 5-20MB       | 1MB      | 小分片以确保快速上传                 |
| 20-50MB      | 2MB      | 适中的分片大小                       |
| 50-100MB     | 4MB      | 增加分片大小以减少分片数量           |
| 100-200MB    | 6MB      | 针对较大文件优化                     |
| 200-500MB    | 10MB     | 显著增加分片大小以减少分片数量       |
| >500MB       | 20MB     | 对于超大文件使用大分片以平衡上传效率 |

## 使用示例

```jsx
<CustomUploadButton
  label="上传视频"
  name="video"
  setLoading={setLoading}
  title="上传视频"
  description="支持上传大视频文件，将自动分块上传"
  max={1}
  chunkUpload={true}
  fileSizeForChunk={2 * 1024 * 1024} // 2MB以上启用分块上传
  concurrentChunks={5} // 5个并发上传分块
  maxConcurrent={6} // 最大并发上传数量
/>
```

## 性能统计

组件会在控制台输出详细的性能统计信息，包括：

- MD5计算时间
- 分块上传初始化时间
- 每个分块的上传时间和速度
- 分块合并时间
- 总上传时间和速度

## 优化效果

通过智能分片策略和MD5计算优化，大文件上传速度显著提升：

- 对于小文件：保持最佳用户体验，等待MD5计算完成后再上传
- 对于大文件：立即开始上传，避免MD5计算造成的延迟
- 分片大小自适应：根据文件大小自动调整，确保最佳上传效率

这种实现可以在保证MD5准确性的同时，通过并行处理显著提升大文件上传速度，特别适合网络良好但CPU性能有限的场景。
