/*
 * @Author: 刘浩奇 liuhaoqw1ko@gmail.com
 * @Date: 2023-04-03 13:09:16
 * @LastEditors: Liu Haoqi liuhaoqw1ko@gmail.com
 * @LastEditTime: 2025-06-03 11:10:13
 * @FilePath: \Antd-pro-Templete\src\utils\dealwithfile.ts
 * @Description:
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import type { RcFile } from 'antd/lib/upload';
import { createMD5, md5 } from 'hash-wasm';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';

/**
 * 根据文件大小确定分片大小
 * @param fileSize 文件大小（字节）
 * @returns 分片大小（字节）
 */
const getChunkSizeByFileSize = (fileSize: number): number => {
  const MB = 1024 * 1024;

  // 根据不同大小范围返回不同的分片大小
  if (fileSize <= 5 * MB) {
    // 0-5M，不分片，返回文件本身大小
    return fileSize;
  } else if (fileSize <= 20 * MB) {
    // 5-20M，每个分片大小1M
    return 1 * MB;
  } else if (fileSize <= 50 * MB) {
    // 20-50M，每个分片大小2M
    return 2 * MB;
  } else if (fileSize <= 100 * MB) {
    // 50-100M，每个分片大小4M
    return 4 * MB;
  } else if (fileSize <= 200 * MB) {
    // 100-200M，每个分片大小6M
    return 6 * MB;
  } else if (fileSize <= 500 * MB) {
    // 200-500M，每个分片大小10M
    return 10 * MB;
  } else if (fileSize <= 2048 * MB) {
    //5个
    return 20 * MB;
  } else if (fileSize <= 4096 * MB) {
    //4个
    return 40 * MB;
  } else {
    //3个
    return 50 * MB;
  }
};

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
const getFileMd5 = async (
  file: File & { md5?: string },
): Promise<{ md5: string; md5Promise?: Promise<string>; tempId?: string }> => {
  // 256MB的阈值，超过此大小则启用异步计算
  const asyncThreshold = 256 * 1024 * 1024;

  try {
    // 对于大文件，先计算第一个分块的MD5作为临时ID
    if (file.size > asyncThreshold) {
      // 获取基于文件大小的分块大小
      const firstChunkSize = getChunkSizeByFileSize(file.size);

      // 只取文件的第一个分块计算临时MD5
      const firstChunk = file.slice(0, firstChunkSize);

      // 计算第一块的MD5
      const hasher = await createMD5();
      await hashChunk(firstChunk, hasher);
      const firstChunkMd5 = hasher.digest();

      // 使用第一个分块的MD5作为临时ID
      const tempId = firstChunkMd5;

      // 创建一个计算完整MD5的Promise
      const md5Promise = new Promise<string>((resolve, reject) => {
        // 使用立即执行的异步函数包装async逻辑
        (async () => {
          try {
            // 创建新的MD5计算器
            const fullHasher = await createMD5();

            // 获取最终的完整MD5
            const finalMd5 = fullHasher.digest();

            console.log(`[MD5性能统计] 完整文件MD5计算完成: ${finalMd5}`);

            // 将完整MD5保存到文件对象
            file.md5 = finalMd5;
            resolve(finalMd5);
          } catch (error) {
            console.error(`[MD5性能统计] 完整MD5计算错误:`, error);
            // 如果计算完整MD5出错，则使用临时MD5作为最终结果
            resolve(tempId);
          }
        })().catch((error) => reject(error));
      });

      // 对于大文件，立即返回临时MD5和完整MD5的Promise
      return {
        md5: tempId, // 使用临时MD5作为初始MD5
        md5Promise, // 提供完整MD5计算的Promise
        tempId, // 同时返回临时ID以便识别
      };
    }

    // 对于小文件（<256MB），直接计算完整MD5

    const hasher = await createMD5();
    await hashChunk(file, hasher);
    const hash = hasher.digest();

    // 保存到文件对象
    file.md5 = hash;

    // 对于小文件，直接返回完整MD5
    return { md5: hash };
  } catch (error) {
    // 发生错误时使用文件名+时间戳的哈希作为临时ID
    const fallbackMd5 = await md5(file.name + Date.now());

    return { md5: fallbackMd5, tempId: fallbackMd5 };
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
