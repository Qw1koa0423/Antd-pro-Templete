/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 13:09:16
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-05-08 17:32:51
 * @FilePath: \Antd-pro-Templete\src\utils\dealwithfile.ts
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import type { RcFile } from 'antd/lib/upload';
import { createMD5, md5 } from 'hash-wasm';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';

/**
 * 处理文件块并更新哈希
 * @param chunk 文件块
 * @param hasher 哈希处理器
 * @returns Promise
 */
function hashChunk(chunk: Blob, hasher: IHasher): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async (e) => {
      try {
        const view = new Uint8Array(e.target?.result as ArrayBuffer);
        hasher.update(view);
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    fileReader.onerror = (error) => reject(error);
    fileReader.readAsArrayBuffer(chunk);
  });
}

/**
 * 获取文件的md5
 * @param file 文件对象
 * @returns 返回文件的md5值
 */
const getFileMd5 = async (file: File & { md5?: string }): Promise<{ md5: string }> => {
  // 256MB的块大小
  const chunkSize = 268435456;
  const startTime = Date.now();

  console.log(
    `[MD5性能统计] 开始计算文件MD5，文件名: ${file.name}, 大小: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
  );

  try {
    const initHasherStart = Date.now();
    const hasher = await createMD5();
    const initHasherEnd = Date.now();
    console.log(
      `[MD5性能统计] 初始化MD5计算器耗时: ${((initHasherEnd - initHasherStart) / 1000).toFixed(3)}秒`,
    );

    // 小文件直接处理
    if (file.size < chunkSize) {
      const smallFileStart = Date.now();
      await hashChunk(file, hasher);
      const hash = hasher.digest();
      const smallFileEnd = Date.now();
      const timeSpent = (smallFileEnd - smallFileStart) / 1000;

      console.log(
        `[MD5性能统计] 小文件MD5计算完成，耗时: ${timeSpent.toFixed(2)}秒, 速度: ${(file.size / 1024 / 1024 / timeSpent).toFixed(2)}MB/s`,
      );

      file.md5 = hash;
      return { md5: hash };
    }

    // 大文件分块处理
    const chunkNumber = Math.ceil(file.size / chunkSize);
    console.log(
      `[MD5性能统计] 大文件分块处理，共 ${chunkNumber} 个分块，每块大小: ${(chunkSize / (1024 * 1024)).toFixed(2)}MB`,
    );

    const processChunks = async () => {
      const chunkTimes: number[] = [];

      for (let i = 0; i < chunkNumber; i++) {
        const chunkStart = Date.now();
        const chunk = file.slice(chunkSize * i, Math.min(chunkSize * (i + 1), file.size));
        await hashChunk(chunk, hasher);
        const chunkEnd = Date.now();
        const chunkTime = (chunkEnd - chunkStart) / 1000;
        chunkTimes.push(chunkTime);

        console.log(
          `[MD5性能统计] 分块 ${i + 1}/${chunkNumber} 处理完成，大小: ${(chunk.size / (1024 * 1024)).toFixed(2)}MB, 耗时: ${chunkTime.toFixed(2)}秒, 速度: ${(chunk.size / 1024 / 1024 / chunkTime).toFixed(2)}MB/s`,
        );
      }

      // 汇总分块处理统计
      const totalChunkTime = chunkTimes.reduce((a, b) => a + b, 0);
      const avgChunkTime = totalChunkTime / chunkNumber;
      const maxChunkTime = Math.max(...chunkTimes);
      const minChunkTime = Math.min(...chunkTimes);

      console.log(`[MD5性能统计] 分块处理统计:
      - 总耗时: ${totalChunkTime.toFixed(2)}秒
      - 平均耗时: ${avgChunkTime.toFixed(2)}秒/块
      - 最大耗时: ${maxChunkTime.toFixed(2)}秒
      - 最小耗时: ${minChunkTime.toFixed(2)}秒
      - 平均速度: ${(file.size / 1024 / 1024 / totalChunkTime).toFixed(2)}MB/s`);

      return hasher.digest();
    };

    const digestStart = Date.now();
    const hash = await processChunks();
    const digestEnd = Date.now();
    console.log(
      `[MD5性能统计] 生成最终哈希值耗时: ${((digestEnd - digestStart) / 1000).toFixed(3)}秒`,
    );

    file.md5 = hash;

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    console.log(
      `[MD5性能统计] MD5计算完成，总耗时: ${totalTime.toFixed(2)}秒, 总速度: ${(file.size / 1024 / 1024 / totalTime).toFixed(2)}MB/s`,
    );

    return { md5: hash };
  } catch (error) {
    const endTime = Date.now();
    console.error(
      `[MD5性能统计] MD5计算错误，总耗时: ${((endTime - startTime) / 1000).toFixed(2)}秒:`,
      error,
    );

    // 回退到简单的MD5计算方式
    const fallbackStart = Date.now();
    const fallbackMd5 = await md5(file.name + new Date().getTime());
    const fallbackEnd = Date.now();

    console.log(
      `[MD5性能统计] 使用回退方法计算MD5，耗时: ${((fallbackEnd - fallbackStart) / 1000).toFixed(3)}秒`,
    );

    return {
      md5: fallbackMd5,
    };
  }
};

/**
 * 获取图片或视频的宽高
 * @param file 文件对象
 * @returns 返回文件的宽高
 */
const getFileWH = (file: RcFile): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    // 处理图片文件
    if (file.type.includes('image')) {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url); // 释放URL对象
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = function (e) {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    }
    // 处理视频文件
    else if (file.type.includes('video')) {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        URL.revokeObjectURL(url);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };

      video.onerror = function (e) {
        URL.revokeObjectURL(url);
        reject(e);
      };

      video.src = url;
    }
    // 处理其他类型文件
    else {
      resolve({
        width: 0,
        height: 0,
      });
    }
  });
};

/**
 * 从视频文件中截取指定时间的帧，并生成图像
 * @param file 视频文件
 * @param time 时间点(秒)
 * @returns 帧图像文件和URL
 */
function getVideoThumbImg(
  file: RcFile,
  time: number = 0, // 默认取第一帧
): Promise<{
  file: File;
  url: string;
}> {
  return new Promise((resolve, reject) => {
    if (!file.type.includes('video')) {
      reject(new Error('不是视频文件'));
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let isResolved = false;

    video.muted = true; // 确保在所有浏览器中都可以自动播放
    video.currentTime = time >= 0 ? time : 0;

    // 设置超时处理
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        URL.revokeObjectURL(url);
        reject(new Error('获取视频帧超时'));
      }
    }, 30000); // 30秒超时

    // 视频可以播放时截取帧
    video.oncanplay = () => {
      try {
        const cvs = document.createElement('canvas');
        cvs.width = video.videoWidth;
        cvs.height = video.videoHeight;

        const ctx = cvs.getContext('2d');
        if (!ctx) {
          throw new Error('无法创建canvas上下文');
        }

        ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

        cvs.toBlob((blob) => {
          if (!blob) {
            throw new Error('生成图像失败');
          }

          clearTimeout(timeoutId);
          URL.revokeObjectURL(url);
          isResolved = true;

          const filename = `${file.name.split('.')[0]}_thumb.png`;
          const frameFile = new File([blob], filename, { type: 'image/png' });
          const thumbUrl = URL.createObjectURL(frameFile);

          resolve({
            file: frameFile,
            url: thumbUrl,
          });
        }, 'image/png');
      } catch (error) {
        clearTimeout(timeoutId);
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    video.onerror = function (e) {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
      reject(e);
    };

    video.src = url;
  });
}

export { getFileMd5, getFileWH, getVideoThumbImg };
