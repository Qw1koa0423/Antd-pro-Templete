/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 16:17:04
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-08 14:23:27
 * @FilePath: \Antd-pro-Templete\src\components\CustomUploadButton\index.tsx
 * @Description: 自定义上传按钮组件
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { customUpload, getFileMd5, getFileWH, getSignature, isExpired } from '@/utils';
import {
  ProFormUploadButton,
  ProFormUploadButtonProps,
  ProFormUploadDragger,
  ProFormUploadDraggerProps,
} from '@ant-design/pro-components';
import { message, Upload } from 'antd';
import type { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/lib/upload';
import { MD5 } from 'crypto-js';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

// 上传类型
type UploadComponentType = 'button' | 'dragger';

// 组件属性类型
interface UploadButtonProps {
  // 基本配置
  uploadType?: UploadComponentType; // 上传类型: button | dragger
  setLoading: React.Dispatch<React.SetStateAction<boolean>>; // 上传状态 需要传给父组件防止没上传就提交了
  fieldProps?: UploadProps; // 自定义fieldProps
  maxConcurrent?: number; // 最大并发上传数量

  // 文件类型限制
  allowedTypes?: string[]; // 允许的文件类型
  typeErrorMessage?: string; // 文件类型错误提示

  // 文件大小限制
  maxFileSize?: number; // 单文件大小限制（字节）
  fileSizeErrorMessage?: string; // 文件大小错误提示
  maxTotalSize?: number; // 多文件大小限制（字节）
  totalSizeErrorMessage?: string; // 总大小错误提示

  // 图片/视频尺寸限制
  maxWidth?: number; // 图片或视频最大宽度
  maxHeight?: number; // 图片或视频最大高度
  dimensionErrorMessage?: string; // 尺寸错误提示

  // 分块上传设置
  chunkUpload?: boolean; // 是否启用分块上传
  fileSizeForChunk?: number; // 触发分块上传的文件大小阈值（字节）

  // 自定义回调
  onFileChange?: (info: UploadChangeParam<UploadFile<any>>) => void; // 文件变更回调
  onUploadSuccess?: (file: UploadFile, response: any) => void; // 上传成功回调
  onUploadError?: (file: UploadFile, error: any) => void; // 上传失败回调
}

// 联合类型定义，根据上传类型区分属性
type CustomUploadProps =
  | (UploadButtonProps & Omit<ProFormUploadButtonProps, 'fieldProps'>)
  | (UploadButtonProps & Omit<ProFormUploadDraggerProps, 'fieldProps'>);

/**
 * 文件上传队列管理
 */
class UploadQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * 添加上传任务到队列
   */
  add(task: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      // 创建包装任务
      const wrappedTask = async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        } finally {
          this.running--;
          this.runNext();
        }
      };

      // 添加到队列
      this.queue.push(wrappedTask);

      // 尝试执行
      this.runNext();
    });
  }

  /**
   * 执行下一个上传任务
   */
  private runNext() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();
    if (task) {
      task().catch(() => {
        // 错误已在 wrappedTask 中处理
      });
    }
  }

  /**
   * 清空上传队列
   */
  clear() {
    this.queue = [];
  }
}

/**
 * 延迟执行
 * @param ms 延迟毫秒数
 */
const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

/**
 * 自定义上传组件，支持按钮和拖拽两种上传方式
 */
const CustomUploadButton: React.FC<CustomUploadProps> = ({
  // 基本配置
  uploadType = 'button',
  setLoading,
  fieldProps,
  maxConcurrent = 3,

  // 文件类型限制
  allowedTypes,
  typeErrorMessage = '文件类型不符合要求！',

  // 文件大小限制
  maxFileSize,
  fileSizeErrorMessage = '文件大小超出限制！',
  maxTotalSize,
  totalSizeErrorMessage = '文件总大小超出限制！',

  // 图片/视频尺寸限制
  maxWidth,
  maxHeight,
  dimensionErrorMessage = '图片宽高超出限制！',

  // 分块上传设置
  chunkUpload = false,
  fileSizeForChunk = 10 * 1024 * 1024, // 默认10MB以上使用分块上传

  // 自定义回调
  onFileChange,
  onUploadSuccess,
  onUploadError,

  // 其他属性
  ...props
}) => {
  // 上传队列管理器
  const uploadQueueRef = useRef<UploadQueue>(new UploadQueue(maxConcurrent));

  // 初始化上传队列
  useEffect(() => {
    uploadQueueRef.current = new UploadQueue(maxConcurrent);
  }, [maxConcurrent]);

  /**
   * 检查文件类型是否符合要求
   */
  const checkFileType = useCallback(
    (file: RcFile): boolean => {
      if (!allowedTypes?.length) return true;

      // 检查MIME类型
      if (allowedTypes.includes(file.type)) return true;

      // 检查文件扩展名
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return allowedTypes.includes(extension);
    },
    [allowedTypes],
  );

  /**
   * 检查文件大小是否符合要求
   */
  const checkFileSize = useCallback(
    (file: RcFile): boolean => {
      return !(maxFileSize && file.size > maxFileSize);
    },
    [maxFileSize],
  );

  /**
   * 检查文件总大小是否符合要求
   */
  const checkTotalSize = useCallback(
    (fileList: RcFile[]): boolean => {
      if (!maxTotalSize) return true;

      let totalSize = 0;
      fileList.forEach((item) => {
        totalSize += item.size;
      });

      return totalSize <= maxTotalSize;
    },
    [maxTotalSize],
  );

  /**
   * 检查文件宽高是否符合要求
   */
  const checkFileDimensions = useCallback(
    async (file: RcFile): Promise<boolean> => {
      if (!maxWidth && !maxHeight) return true;

      try {
        const { width, height } = await getFileWH(file);
        return !((maxWidth && width > maxWidth) || (maxHeight && height > maxHeight));
      } catch (error) {
        console.error('检查文件尺寸失败:', error);
        return false;
      }
    },
    [maxWidth, maxHeight],
  );

  /**
   * 上传前验证
   */
  const beforeUpload = useCallback(
    async (file: RcFile, fileList: RcFile[]): Promise<boolean | typeof Upload.LIST_IGNORE> => {
      setLoading(true);

      try {
        // 刷新上传认证
        await isExpired();

        // 验证文件类型
        if (!checkFileType(file)) {
          message.error(typeErrorMessage);
          setLoading(false);
          return Upload.LIST_IGNORE;
        }

        // 验证单个文件大小
        if (!checkFileSize(file)) {
          message.error(fileSizeErrorMessage);
          setLoading(false);
          return Upload.LIST_IGNORE;
        }

        // 验证文件总大小
        if (!checkTotalSize(fileList)) {
          message.error(totalSizeErrorMessage);
          setLoading(false);
          return Upload.LIST_IGNORE;
        }

        // 验证文件宽高
        if (!(await checkFileDimensions(file))) {
          message.error(dimensionErrorMessage);
          setLoading(false);
          return Upload.LIST_IGNORE;
        }

        return true;
      } catch (error) {
        console.error('文件上传前验证失败:', error);
        message.error('文件验证失败，请重试');
        setLoading(false);
        return Upload.LIST_IGNORE;
      }
    },
    [
      setLoading,
      typeErrorMessage,
      fileSizeErrorMessage,
      totalSizeErrorMessage,
      dimensionErrorMessage,
      checkFileType,
      checkFileSize,
      checkTotalSize,
      checkFileDimensions,
    ],
  );

  /**
   * 自定义上传实现
   */
  const customRequest = useCallback(
    ({ file, onSuccess, onError, onProgress }: any) => {
      const uploadFile = file as RcFile;

      // 使用上传队列管理上传任务
      uploadQueueRef.current
        .add(async () => {
          try {
            // 获取上传配置
            const uploadConfig = await isExpired();

            // 准备文件附加信息
            const { md5 } = await getFileMd5(uploadFile);
            const suffix = uploadFile.name.slice(uploadFile.name.lastIndexOf('.'));
            const uploadUrl = uploadConfig.path + md5 + suffix;
            const signature = getSignature(uploadConfig);

            let result;

            // 根据文件大小决定是否使用分块上传
            if (chunkUpload && uploadFile.size > fileSizeForChunk) {
              // 对于分块上传，模拟进度反馈
              for (let i = 0; i <= 10; i++) {
                await delay(300);
                if (onProgress) {
                  onProgress({ percent: Math.floor((i / 10) * 100) });
                }
              }

              // 实际上传
              result = await customUpload(uploadFile, uploadConfig);
            } else {
              // 常规上传
              result = await customUpload(uploadFile, uploadConfig);
              if (onProgress) {
                onProgress({ percent: 100 });
              }
            }

            const responseData = {
              name: uploadFile.name,
              status: 'done',
              url: result.url,
              uploadUrl,
              ...signature,
            };

            if (onSuccess) {
              onSuccess(responseData, uploadFile);
            }

            if (onUploadSuccess) {
              onUploadSuccess(uploadFile as UploadFile, responseData);
            }

            return responseData;
          } catch (error) {
            console.error('文件上传失败:', error);

            if (onError) {
              onError(error);
            }

            if (onUploadError) {
              onUploadError(uploadFile as UploadFile, error);
            }

            throw error;
          }
        })
        .catch((error) => {
          console.error('上传队列处理失败:', error);
        });
    },
    [chunkUpload, fileSizeForChunk, onUploadSuccess, onUploadError],
  );

  /**
   * 获取上传地址
   */
  const getUploadAction = useCallback(async (): Promise<string> => {
    try {
      const { endPoint } = await isExpired();
      return endPoint || API_URL + '/upload';
    } catch (error) {
      console.error('获取上传地址失败:', error);
      return API_URL + '/upload';
    }
  }, []);

  /**
   * 文件变化事件处理
   */
  const handleFileChange = useCallback(
    async (info: UploadChangeParam<UploadFile<any>>) => {
      try {
        const { host } = await isExpired();

        // 更新文件URL
        if (info.file.url && host) {
          info.file.url = host + info.file.url;
        }

        // 判断上传状态
        const isUploading = info.fileList.some((item) => item.status === 'uploading');
        setLoading(isUploading);

        if (!isUploading && onFileChange) {
          onFileChange(info);
        }

        return info;
      } catch (error) {
        console.error('处理文件变化失败:', error);
        setLoading(false);
        return info;
      }
    },
    [setLoading, onFileChange],
  );

  /**
   * 准备上传文件的额外数据
   */
  const prepareFileData = useCallback(async (file: UploadFile<any> & { md5?: string }) => {
    try {
      const uploadData = await isExpired();
      const suffix = file.name.slice(file.name.lastIndexOf('.'));
      const signature = getSignature(uploadData);

      try {
        // 获取文件MD5
        const { md5 } = await getFileMd5(file as unknown as File);
        file.url = uploadData.path + md5 + suffix;
        return { ...signature, key: file.url };
      } catch (error) {
        // MD5计算失败，使用时间戳和随机数生成唯一标识
        const fallbackId = MD5(Date.now().toString() + Math.random().toString()).toString();
        file.url = uploadData.path + fallbackId + suffix;
        return { ...signature, key: file.url };
      }
    } catch (error) {
      console.error('准备文件数据失败:', error);
      return {};
    }
  }, []);

  // 共享的field属性
  const sharedFieldProps = useMemo(
    () => ({
      name: 'file',
      action: getUploadAction,
      beforeUpload,
      onChange: handleFileChange,
      data: prepareFileData,
      customRequest: chunkUpload ? customRequest : undefined,
      ...fieldProps,
    }),
    [
      getUploadAction,
      beforeUpload,
      handleFileChange,
      prepareFileData,
      chunkUpload,
      customRequest,
      fieldProps,
    ],
  );

  // 根据上传类型渲染不同组件
  return (
    <>
      {uploadType === 'button' ? (
        <ProFormUploadButton fieldProps={sharedFieldProps} {...props} />
      ) : (
        <ProFormUploadDragger fieldProps={sharedFieldProps} {...props} />
      )}
    </>
  );
};

export default CustomUploadButton;
