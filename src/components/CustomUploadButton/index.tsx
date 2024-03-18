/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 16:17:04
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-18 16:48:22
 * @FilePath: \Antd-pro-Templete\src\components\CustomUploadButton\index.tsx
 * @Description:
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
import React from 'react';
interface UploadButtonProps {
  uploadType?: 'button' | 'dragger'; //上传类型
  _Setloading: React.Dispatch<React.SetStateAction<boolean>>; //设置确认按钮loading
  _fileTypes?: string[]; //文件类型限制
  _fileTypesError?: string; //文件类型限制错误
  _fileSize?: number; //单文件大小限制
  _fileSizeError?: string; //单文件大小限制错误提示
  _filesSize?: number; //多文件大小限制
  _filesSizeError?: string; //多文件大小限制
  _fieldProps?: UploadProps; //自定义fieldProps
  _fileWidth?: number; //图片或视频宽限制
  _fileHeight?: number; //图片或视频高限制
  _fileWHError?: string; //图片或宽高限制错误提示
  _handleCustomFn?: (info: UploadChangeParam<UploadFile<any>>) => void; //自定义方法
}

const CustomUploadButton: React.FC<
  | (UploadButtonProps & Omit<ProFormUploadButtonProps, 'fieldProps'>)
  | (UploadButtonProps & Omit<ProFormUploadDraggerProps, 'fieldProps'>)
> = ({
  uploadType = 'button',
  _Setloading,
  _fileSize,
  _fileSizeError,
  _filesSize,
  _filesSizeError,
  _fileTypes,
  _fileTypesError,
  _fieldProps,
  _fileHeight,
  _fileWidth,
  _fileWHError,
  _handleCustomFn,
  ...props
}) => {
  /** 判断过期 */

  /** 上传前处理 */
  const beforeUpload = async (file: RcFile, fileList: RcFile[]) => {
    _Setloading(true);
    await isExpired();
    if (
      _fileTypes &&
      !_fileTypes.includes(file.type) &&
      !_fileTypes.includes(file.name.split('.')[1])
    ) {
      message.error(_fileTypesError || '文件类型不符合要求！');
      _Setloading(false);
      return Upload.LIST_IGNORE;
    }
    if (_fileSize && file.size > _fileSize) {
      message.error(_fileSizeError || '文件大小超出限制！');
      _Setloading(false);
      return Upload.LIST_IGNORE;
    }
    if (_filesSize) {
      let allFileSize = 0;
      fileList.forEach((item) => {
        allFileSize += item.size;
      });
      if (allFileSize > _filesSize) {
        message.error(_filesSizeError || '文件总大小超出限制！');
        _Setloading(false);
        return Upload.LIST_IGNORE;
      }
    }
    if (_fileWidth || _fileHeight) {
      const { width, height } = await getFileWH(file);
      if ((_fileWidth && width > _fileWidth) || (_fileHeight && height > _fileHeight)) {
        message.error(_fileWHError || '图片宽高超出限制！');
        _Setloading(false);
        return Upload.LIST_IGNORE;
      }
    }
    return true;
  };
  const action = async (): Promise<string> => {
    const { endPoint } = await isExpired();
    return endPoint || '';
  };
  /** 文件改变 */
  const onFileChange = async (info: UploadChangeParam<UploadFile<any>>) => {
    const { host } = await isExpired();
    info.file.url = host + info.file.url;
    if (info.fileList.every((item) => item.status !== 'uploading')) {
      console.log('finished', info);
      _Setloading(false);
      if (_handleCustomFn) _handleCustomFn(info);
    } else {
      _Setloading(true);
    }
    return info;
  };
  /** 文件参数 */
  const fileData = async (file: UploadFile<any>) => {
    const uploadData = await isExpired();
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    const signature = getSignature(uploadData);
    try {
      const { md5 } = await getFileMd5(file as unknown as File);
      file.url = uploadData.path + md5 + suffix;
      return Object.assign({ key: file.url }, signature);
    } catch (error) {
      file.url = uploadData.path + MD5(Date.now().toString() + Math.random().toString()) + suffix;
      return Object.assign({ key: file.url }, signature);
    }
  };

  return uploadType === 'button' ? (
    <ProFormUploadButton
      fieldProps={{
        name: 'file',
        action,
        beforeUpload,
        data: fileData,
        onChange: onFileChange,
        ..._fieldProps,
      }}
      {...props}
    />
  ) : (
    <ProFormUploadDragger
      fieldProps={{
        name: 'file',
        action,
        beforeUpload,
        onChange: onFileChange,
        data: fileData,
        ..._fieldProps,
      }}
      {...props}
    />
  );
};

export default CustomUploadButton;
