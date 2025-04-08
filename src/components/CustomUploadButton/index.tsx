/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 16:17:04
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-04-07 17:56:43
 * @FilePath: \Antd-pro-Templete\src\components\CustomUploadButton\index.tsx
 * @Description: 自定义上传按钮组件
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { getFileMd5, getFileWH, getSignature, isExpired } from '@/utils';
import {
  ProFormUploadButton,
  ProFormUploadButtonProps,
  ProFormUploadDragger,
  ProFormUploadDraggerProps,
} from '@ant-design/pro-components';
import { message, Upload } from 'antd';
import type { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/lib/upload';
import { MD5 } from 'crypto-js';
import React, { useCallback, useMemo } from 'react';

// 上传类型
type UploadComponentType = 'button' | 'dragger';

// 组件属性类型
interface UploadButtonProps {
  // 基本配置
  uploadType?: UploadComponentType; // 上传类型: button | dragger
  setLoading: React.Dispatch<React.SetStateAction<boolean>>; // 上传状态 需要传给父组件防止没上传就提交了
  fieldProps?: UploadProps; // 自定义fieldProps

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

  // 自定义回调
  onFileChange?: (info: UploadChangeParam<UploadFile<any>>) => void; // 文件变更回调
}

// 联合类型定义，根据上传类型区分属性
type CustomUploadProps =
  | (UploadButtonProps & Omit<ProFormUploadButtonProps, 'fieldProps'>)
  | (UploadButtonProps & Omit<ProFormUploadDraggerProps, 'fieldProps'>);

/**
 * 自定义上传组件，支持按钮和拖拽两种上传方式
 */
const CustomUploadButton: React.FC<CustomUploadProps> = ({
  // 基本配置
  uploadType = 'button',
  setLoading,
  fieldProps,

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

  // 自定义回调
  onFileChange,

  // 其他属性
  ...props
}) => {
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
      ...fieldProps,
    }),
    [getUploadAction, beforeUpload, handleFileChange, prepareFileData, fieldProps],
  );

  // 根据上传类型渲染不同组件
  return uploadType === 'button' ? (
    <ProFormUploadButton fieldProps={sharedFieldProps} {...props} />
  ) : (
    <ProFormUploadDragger fieldProps={sharedFieldProps} {...props} />
  );
};

export default CustomUploadButton;
