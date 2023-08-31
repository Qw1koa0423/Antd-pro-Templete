/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-03-30 16:17:04
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-08-31 10:02:24
 * @FilePath: \Antd-pro-Templete\src\components\CustomUploadButton\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { customUpload, getFileMd5, getFileSize, getSignature, getVideoThumbImg } from '@/utils';

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
  customLoading: React.Dispatch<React.SetStateAction<boolean>>; //设置确认按钮loading
  customFileType?: string[]; //文件类型限制
  customFileSize?: number[]; //文件大小限制 第一个参数为单个文件大小限制 第二个参数为文件总大小限制
  customFileSizeError?: string[]; //文件大小限制错误提示 第一个参数为单个文件大小限制错误提示 第二个参数为文件总大小限制错误提示
  customFileTypeError?: string; //文件类型限制错误提示
  customFrameCust?: boolean; //是否自定义上传
  customFieldProps?: UploadProps; //自定义fieldProps
  customFileWH?: number[];
  customRatio?: number[];
  customGetUploadAuth: () => Promise<{
    channel: string;
    host: string;
    path: string;
    bucket?: string;
    endPoint?: string;
    expiredTime: number;
    accessKeyId?: string;
    accessKeySecret?: string;
    securityToken?: string;
  }>; //获取上传凭证的方法
}

const CustomUploadButton: React.FC<
  | (UploadButtonProps & Omit<ProFormUploadButtonProps, 'fieldProps'>)
  | (UploadButtonProps & Omit<ProFormUploadDraggerProps, 'fieldProps'>)
> = ({
  uploadType = 'button',
  customLoading,
  customFileType,
  customFileSize,
  customFileSizeError,
  customFileTypeError,
  customGetUploadAuth,
  customFieldProps,
  customFileWH,
  customRatio,
  customFrameCust = false,
  ...props
}) => {
  /** 上传前处理 */
  const beforeUpload = async (
    file: RcFile & { url?: string; width?: number; height?: number; thumbUrl?: string },
    fileList: RcFile[],
  ) => {
    /** 判断有无上传权限，是否过期 */
    if (
      window.localStorage.getItem('uploadData') === null ||
      JSON.parse(window.localStorage.getItem('uploadData') || '{}').expiredTime * 1000 < Date.now()
    ) {
      await customGetUploadAuth().then((res) => {
        window.localStorage.setItem('uploadData', JSON.stringify(res));
      });
    }
    file.url = JSON.parse(window.localStorage.getItem('uploadData') || '{}').path;
    customLoading(true);
    /** 判断文件大小 */
    if (customFileSize && file.size > customFileSize[0]) {
      message.error((customFileSizeError && customFileSizeError[0]) || '文件大小超出限制');
      customLoading(false);
      return Upload.LIST_IGNORE;
    }
    /** 判断文件总大小 */
    if (customFileSize && customFileSize[1]) {
      let sum = 0;
      fileList.forEach((item) => {
        sum += item.size;
      });
      if (sum > customFileSize[1]) {
        message.error((customFileSizeError && customFileSizeError[1]) || '文件总大小超出限制');
        customLoading(false);
        return Upload.LIST_IGNORE;
      }
    }
    /** 判断文件类型 */
    if (
      customFileType &&
      !customFileType.includes(file.type) &&
      !customFileType.includes(file.name.split('.')[1])
    ) {
      message.error(customFileTypeError || '文件类型不符合要求');
      customLoading(false);
      return Upload.LIST_IGNORE;
    }
    await getFileSize(file);
    /** 判断文件尺寸 */
    if (customFileWH) {
      if (customFileWH[0] !== file.width || customFileWH[1] !== file.height) {
        message.error(`请上传宽为${customFileWH[0]}px,高为${customFileWH[1]}px的图片`);
        customLoading(false);
        return Upload.LIST_IGNORE;
      }
    }
    // 判断宽高比
    if (customRatio && file.width && file.height) {
      if (file.width / file.height !== customRatio[0] / customRatio[1]) {
        message.error(`请上传宽高比为${customRatio[0]}:${customRatio[1]}的图片`);
        customLoading(false);
        return Upload.LIST_IGNORE;
      }
    }
    /** 假如是视频 */
    if (file.type.includes('video')) {
      getVideoThumbImg(file, 2)
        .then(async (res) => {
          /** 需要上传截取的图片 */
          if (customFrameCust) {
            let thumbImgFile = res;
            await customUpload(
              thumbImgFile,
              JSON.parse(window.localStorage.getItem('uploadData') || '{}'),
            );
            file.thumbUrl =
              JSON.parse(window.localStorage.getItem('uploadData') || '{}').host + thumbImgFile.url;
          } else {
            /** 不需要上传 */
            file.thumbUrl = res.url;
          }
        })
        .catch(() => {
          return Upload.LIST_IGNORE;
        });
    }
    return file;
  };

  /** 文件改变 */
  const onFileChange = (info: UploadChangeParam<UploadFile<any>>) => {
    info.file.url =
      JSON.parse(window.localStorage.getItem('uploadData') || '{}').host + info.file.url;
    if (info.fileList.every((item) => item.status === 'done')) {
      customLoading(false);
    } else {
      customLoading(true);
    }
    return info;
  };
  /** 文件参数 */
  const fileData = (file: UploadFile<any>) => {
    return getFileMd5(file as RcFile)
      .then((res) => {
        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        file.url += res.md5 + suffix;
        const signature = getSignature(
          JSON.parse(window.localStorage.getItem('uploadData') || '{}'),
        );
        return Object.assign({ key: file.url }, signature);
      })
      .catch(() => {
        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        file.url += MD5(Date.now().toString() + Math.random().toString()) + suffix;
        const signature = getSignature(
          JSON.parse(window.localStorage.getItem('uploadData') || '{}'),
        );
        return Object.assign({ key: file.url }, signature);
      });
  };
  return uploadType === 'button' ? (
    <ProFormUploadButton
      fieldProps={{
        name: 'file',
        action: JSON.parse(window.localStorage.getItem('uploadData') || '{}').endPoint,
        beforeUpload,
        onChange: onFileChange,
        data: fileData,
        ...customFieldProps,
      }}
      {...props}
    />
  ) : (
    <ProFormUploadDragger
      fieldProps={{
        name: 'file',
        action: JSON.parse(window.localStorage.getItem('uploadData') || '{}').endPoint,
        beforeUpload,
        onChange: onFileChange,
        data: fileData,
        ...customFieldProps,
      }}
      {...props}
    />
  );
};

export default CustomUploadButton;
