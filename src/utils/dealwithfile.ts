/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 13:09:16
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2024-03-18 19:08:05
 * @FilePath: \Antd-pro-Templete\src\utils\dealwithfile.ts
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import type { RcFile } from 'antd/lib/upload';
import CryptoJS from 'crypto-js';
/** 获取文件的md5 */
const getFileMd5 = (file: File): Promise<{ md5: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const wordArray = CryptoJS.enc.Latin1.parse(e.target?.result as string);
      const md5Hash = CryptoJS.MD5(wordArray).toString();
      resolve({
        md5: md5Hash,
      });
    };
    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsBinaryString(file);
  });
};
/** 获取图片或视频的宽高 */
const getFileWH = (file: RcFile): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.onload = function () {
          resolve({
            width: img.width,
            height: img.height,
          });
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
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.onerror = function (e) {
        reject(e);
      };
      video.src = URL.createObjectURL(file);
    } else {
      resolve({
        width: 0,
        height: 0,
      });
    }
  });
};

/** 从视频文件中截取指定时间的帧，并生成图像。 */
function getVideoThumbImg(
  file: RcFile,
  time: number,
): Promise<{
  file: File;
  url: string;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.currentTime = time;
    // 在静音状态下所有浏览器都可以自动播放视频
    video.oncanplay = () => {
      const cvs = document.createElement('canvas');
      cvs.width = video.videoWidth;
      cvs.height = video.videoHeight;
      const ctx = cvs.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(video, 0, 0, cvs.width, cvs.height);
      cvs.toBlob((blob) => {
        const frameFile = new File([blob as Blob], 'thumb__img.png', { type: 'image/png' });
        const url = URL.createObjectURL(frameFile);
        resolve({
          file: frameFile,
          url,
        });
      });
    };
    video.onerror = function (e) {
      reject(e);
    };
    video.src = URL.createObjectURL(file) as unknown as string;
  });
}
export { getFileMd5, getFileWH, getVideoThumbImg };
