/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 13:09:16
 * @LastEditors: 刘浩奇 liuhaoqw1ko@gmail.com
 * @LastEditTime: 2023-04-14 10:29:31
 * @FilePath: \Templete\src\utils\dealwithfile.ts
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import type { RcFile } from 'antd/lib/upload';
import CryptoJS from 'crypto-js';
/** 获取文件的md5 */
const getFileMd5 = (
  file: RcFile & { md5?: string; width?: number; height?: number },
): Promise<RcFile & { md5?: string; width?: number; height?: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const wordArray = CryptoJS.enc.Latin1.parse(e.target?.result as string);
      const md5Hash = CryptoJS.MD5(wordArray).toString();
      file.md5 = md5Hash;
      resolve(file);
    };
    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsBinaryString(file);
  });
};
/** 获取图片或视频的宽高 */
const getFileSize = (
  file: RcFile & { md5?: string; width?: number; height?: number },
): Promise<RcFile & { md5?: string; width?: number; height?: number }> => {
  return new Promise((resolve, reject) => {
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.onload = function () {
          let newFile = file;
          file.width = img.width;
          file.height = img.height;
          resolve(newFile);
        };
        img.onerror = function (e) {
          reject(e);
        };
        img.src = URL.createObjectURL(file);
      };
      reader.onerror = function (e) {
        reject(e);
      };
      reader.readAsBinaryString(file);
    } else if (file.type.includes('video')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        file.width = video.videoWidth;
        file.height = video.videoHeight;
        resolve(file);
      };
      video.onerror = function (e) {
        reject(e);
      };
      video.src = URL.createObjectURL(file);
    } else {
      resolve(file);
    }
  });
};

/** 截取视频帧 */
function getVideoThumbImg(file: RcFile, second: number): Promise<RcFile & { url?: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.currentTime = second;
    video.onloadeddata = function () {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(
        function (blob) {
          const frameFile = new File([blob as Blob], 'thumb__img.png', { type: 'image/png' });
          const url = URL.createObjectURL(frameFile);
          resolve(Object.assign(frameFile, { url }) as RcFile & { url?: string });
        },
        'image/png',
        0.8,
      );
    };
    video.onerror = function (e) {
      reject(e);
    };
    video.src = URL.createObjectURL(file) as unknown as string;
  });
}
export { getFileMd5, getFileSize, getVideoThumbImg };
