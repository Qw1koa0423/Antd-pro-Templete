/*
 * @Author: 刘浩奇 liuhaoqi@yaozai.net
 * @Date: 2023-03-22 14:01:46
 * @LastEditors: 刘浩奇 liuhaoqi@yaozai.net
 * @LastEditTime: 2023-03-28 14:53:35
 * @FilePath: \Templete\mock\index.ts
 * @Description: 模拟数据
 *
 * Copyright (c) 2023 by 遥在科技, All Rights Reserved.
 */
import { Request, Response } from 'express';
import Mock from 'mockjs';
import * as area from './area.json';
type AREA_TYPE = {
  label: string;
  value: number;
  children: AREA_TYPE[] | [];
};
/** 模拟网络延迟 */
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
/** 用户数据 */
let users = [
  {
    id: 1,
    username: '超级管理员',
    account: 'admin',
    password: 'admin',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    status: 0,
    createTime: '2023-03-22 14:08:46',
    updateTime: '',
    region: [11, 1101, 110101],
    role: [1],
  },
  {
    id: 2,
    username: '普通用户',
    account: 'user',
    password: 'user',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    status: 0,
    createTime: '2023-03-22 14:09:57',
    updateTime: '',
    region: [11, 1101, 110102],
    role: [2],
  },
];
/** 角色表 */
let roles = [
  {
    id: 1,
    name: '超级管理员',
    createTime: '2023-03-22 14:28:16',
    updateTime: '',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },
  {
    id: 2,
    name: '普通用户',
    createTime: '2023-03-22 14:47:22',
    updateTime: '',
    permissions: [1],
  },
];
/** 权限表 */
const permissions: { id: number; name: string; path: string; method: 'GET' | 'POST' }[] = [
  {
    id: 1,
    name: '用户列表',
    path: '/user/list',
    method: 'GET',
  },
  {
    id: 2,
    name: '用户详情',
    path: '/user/detail',
    method: 'GET',
  },
  {
    id: 3,
    name: '用户新增',
    path: '/user/add',
    method: 'POST',
  },
  {
    id: 4,
    name: '用户编辑',
    path: '/user/update',
    method: 'POST',
  },
  {
    id: 5,
    name: '用户删除',
    path: '/user/delete',
    method: 'POST',
  },
  {
    id: 6,
    name: '操作日志',
    path: '/log/list',
    method: 'GET',
  },
  {
    id: 7,
    name: '角色列表',
    path: '/role/list',
    method: 'GET',
  },
  {
    id: 8,
    name: '角色详情',
    path: '/role/detail',
    method: 'GET',
  },
  {
    id: 9,
    name: '角色新增',
    path: '/role/add',
    method: 'POST',
  },
  {
    id: 10,
    name: '角色编辑',
    path: '/role/update',
    method: 'POST',
  },
  {
    id: 11,
    name: '角色删除',
    path: '/role/delete',
    method: 'POST',
  },
  {
    id: 12,
    name: '权限列表',
    path: '/permission/list',
    method: 'GET',
  },
  {
    id: 13,
    name: '上传参数',
    path: '/upload/params',
    method: 'GET',
  },
  {
    id: 14,
    name: '上传文件',
    path: '/upload/file',
    method: 'POST',
  },
];

/** 操作日志 */
let logs: {
  id: number;
  username: string;
  account: string;
  detail: string;
  createTime: string;
}[] = [];
/** 定义一个 token 存储对象 */
const tokenMap: {
  [key: string]: {
    username: string;
    account: string;
    avatar: string;
    role: number[];
    permissions: string[];
    token: any;
    expiredAt: number;
  };
} = {};
/** token鉴权 */
const authenticateToken = (token: string, res: Response) => {
  if (!token || !tokenMap[token]) {
    res.send({
      code: 999999,
      data: {},
      msg: '未登录或登录已过期，请重新登录！',
    });
    return;
  }
  const currentUser = tokenMap[token];

  if (currentUser.expiredAt < Date.now()) {
    /** 当前 token 已经过期 */
    res.send({
      code: 999999,
      data: {},
      msg: '登录已过期，请重新登录！',
    });
    return;
  }
  return currentUser;
};
/** 递归获得地址名称 */
function findArea(value: number[], data: AREA_TYPE[]): string[] {
  let result: string[] = [];
  let current = data.find((item) => item.value === value[0]);
  result.push(current?.label || '未知');
  for (let i = 1; i < value.length; i++) {
    current = current?.children.find((item) => item.value === value[i]);
    result.push(current?.label || '未知');
  }
  return result;
}
/** 添加操作日志 */
const addOperationLog = async (username: string, account: string, detail: string) => {
  const newLog = {
    id: logs.length > 0 ? Math.max(...logs.map((log) => log.id)) + 1 : 1,
    username: username,
    account: account,
    detail: detail,
    createTime: Mock.mock('@now'),
  };
  logs.push(newLog);
};
/** 登录 */
const login = async (req: Request, res: Response) => {
  const { account, password } = req.body;
  await waitTime(1000);
  if (!account || !password) {
    res.send({
      code: 1,
      data: {},
      msg: '参数错误！',
    });
    return;
  }
  const user = users.find((item) => item.account === account && item.password === password);
  if (user) {
    users = users.map((item) => {
      if (item.account === account) {
        item.status = 1;
      }
      return item;
    });
    /** 定义匹配权限数组 */
    const matchedPermissions: string[] = [];
    permissions.forEach((permission) => {
      if (
        user.role.some((roleId) => {
          const role = roles.find((role) => role.id === roleId);
          return role && role.permissions.includes(permission.id);
        })
      ) {
        /** 将匹配的权限添加进数组 */
        matchedPermissions.push(permission.path);
      }
    });
    const token = Mock.mock('@guid');
    const currentUser = {
      username: user.username,
      account: user.account,
      avatar: user.avatar,
      role: user.role,
      permissions: matchedPermissions,
      token: token,
      /** 设置过期时间为当前时间加上 2 小时 */
      expiredAt: Date.now() + 7200000,
    };
    /** 将当前用户信息存储到 tokenMap 对象中 */
    tokenMap[token] = currentUser;
    /** 添加一条新的操作日志 */
    addOperationLog(user.username, user.account, '登录');
    res.send({
      code: 0,
      data: currentUser,
      msg: '登录成功',
    });
  } else {
    res.send({
      code: 1,
      data: {},
      msg: '用户名或密码错误！',
    });
  }
};
/** 退出登录 */
const logout = async (req: Request, res: Response) => {
  const token = req.headers['x-auth-token'] as string;
  /** 从 tokenMap 对象中获取当前用户信息 */
  const currentUser = tokenMap[token];

  /** 如果 currentUser 存在，则将对应用户的状态设为 0 */
  if (currentUser) {
    users = users.map((item) => {
      if (item.account === currentUser.account) {
        item.status = 0;
      }
      return item;
    });
    addOperationLog(currentUser.username, currentUser.account, '退出登录');
    /** 从 tokenMap 对象中删除当前用户信息  */
    delete tokenMap[token];
    res.send({
      code: 0,
      data: {},
      msg: '退出成功',
    });
  }
};
/** 获取省市区列表 */
const getRegionList = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  addOperationLog(currentUser.username, currentUser.account, '获取省市区列表');
  res.send({
    code: 0,
    data: {
      list: area,
    },
    msg: '获取成功',
  });
};
/** 获取用户列表 */
const getUserList = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/user/list')) {
    res.status(401).send({ code: 1, msg: '您没有获取角色列表的权限！' });
    return;
  }
  /** 获取查询参数 */
  const { keyWords, startTime, endTime, roleId, current, pageSize } = req.query;
  /** 将字符串类型的 page 和 pageSize 转换为数字类型 */
  const currentNumber = parseInt(current as string) || 1;
  const pageSizeNumber = parseInt(pageSize as string) || 10;
  /** 计算起始索引和结束索引 */
  const startIndex = (currentNumber - 1) * pageSizeNumber;
  const endIndex = startIndex + pageSizeNumber;
  const filteredUsers = users.filter((user) => {
    /** 如果没有查询条件，则返回所有用户 */
    if (!keyWords && !startTime && !endTime && !roleId) {
      return true;
    }
    /** 模糊匹配用户名和账号 */
    if (keyWords && user.username.includes(keyWords.toString())) {
      return true;
    }
    if (keyWords && user.account.includes(keyWords.toString())) {
      return true;
    }
    /** 匹配创建时间 */
    if (startTime && endTime) {
      const createTime = new Date(user.createTime).getTime();
      const start = new Date(startTime as string).getTime();
      const end = new Date(endTime as string).getTime();
      return start <= createTime && createTime <= end;
    }
    /** 精确匹配角色名称 */
    if (roleId) {
      const role = roles.find((r) => r.id === user.role[0]);
      if (role && role.id === +roleId) {
        return true;
      }
    }
    return false;
  });
  const userList = filteredUsers.slice(startIndex, endIndex).map((user) => {
    const [province, city, district] = findArea(user.region, area);
    /** 获取角色名称 */
    const role = roles.find((r) => r.id === user.role[0]);
    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      account: user.account,
      createTime: user.createTime,
      updateTime: user.updateTime,
      region: [province, city, district],
      status: user.status,
      roleName: role ? role.name : '未知',
    };
  });
  addOperationLog(currentUser.username, currentUser.account, '获取用户列表');
  res.send({
    code: 0,
    data: {
      list: userList,
      total: filteredUsers.length,
      current: currentNumber,
      pageSize: pageSizeNumber,
    },
    msg: '获取成功',
  });
};
/** 获取用户详情 */
const getUserDetail = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/user/detail')) {
    res.status(401).send({ code: 1, msg: '您没有获取用户详情的权限！' });
    return;
  }
  const userId = Number(req.query.id);
  /** 判断有无参数 */
  if (!userId) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  const user = users.find((user) => user.id === userId);
  if (user) {
    const [province, city, district] = findArea(user.region, area);

    const permissionNames: string[] = roles.reduce((result: string[], role) => {
      if (user.role.includes(role.id)) {
        const resPermissions: string[] = role.permissions.map(
          (permissionId) =>
            permissions.find((permission) => permission.id === permissionId)?.name || '',
        );
        return result.concat(resPermissions || []);
      } else {
        return result;
      }
    }, []);
    const role = roles.find((r) => r.id === user.role[0]);

    addOperationLog(currentUser.username, currentUser.account, `获取${user.account}详情`);
    res.send({
      code: 0,
      data: {
        ...user,
        regionNames: [province, city, district],
        roleNames: role ? role.name : '未知',
        permissionNames,
      },
      msg: '获取成功',
    });
  } else {
    res.send({
      code: 404,
      data: {},
      msg: '未找到该用户！',
    });
  }
};
/** 添加新用户 */
const addUser = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/user/add')) {
    res.status(401).send({ code: 1, msg: '您没有添加用户的权限！' });
    return;
  }
  const { username, account, password, avatar, region, role } = req.body;

  /** 判断有无参数 */
  if (!username || !account || !password || !role || !region || !avatar) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  /** 检查用户名是否已存在 */
  if (users.some((user) => user.account === account)) {
    res.send({
      code: 400,
      data: {},
      msg: '该用户名已被占用！',
    });
    return;
  }
  /** 生成新用户 ID */
  const userId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  /** 创建新用户对象 */
  const newUser = {
    id: userId,
    username: username,
    account: account,
    password: password,
    avatar: avatar || '',
    region: region.map((item: string) => Number(item)) || '',
    status: 0,
    createTime: Mock.mock('@now'),
    updateTime: Mock.mock('@now'),
    role: role,
  };

  /** 将新用户添加到用户列表中 */
  users.push(newUser);
  addOperationLog(currentUser.username, currentUser.account, `添加新用户 ${newUser.account}`);
  res.send({
    code: 0,
    data: {},
    msg: '添加用户成功',
  });
};
/** 更新用户信息 */
const updateUser = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/user/update')) {
    res.status(401).send({ code: 1, msg: '您没有更新用户的权限！' });
    return;
  }
  const userId = Number(req.body.id);
  const { username, password, avatar, region, role } = req.body;
  /** 判断有无参数 */
  if (!userId || !username || !password || !role || !region || !avatar) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  const userIndex = users.findIndex((user) => user.id === userId);
  if (typeof userIndex === 'undefined' || userIndex < 0) {
    res.send({
      code: 404,
      data: {},
      msg: '未找到该用户！',
    });
    return;
  }
  users[userIndex].username = username || users[userIndex].username;
  users[userIndex].password = password || users[userIndex].password;
  users[userIndex].avatar = avatar || users[userIndex].avatar;
  users[userIndex].region = region || users[userIndex].region;
  users[userIndex].role = role || users[userIndex].role;
  users[userIndex].updateTime = Mock.mock('@now');

  addOperationLog(
    currentUser.username,
    currentUser.account,
    `更新用户${users[userIndex].account}信息`,
  );
  res.send({
    code: 0,
    data: {},
    msg: '更新用户信息成功',
  });
};
/** 删除用户 */
const deleteUser = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/user/delete')) {
    res.status(401).send({ code: 1, msg: '您没有删除用户的权限！' });
    return;
  }

  const userId = Number(req.body.id);

  /** 判断有无参数 */
  if (!userId) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  const userIndex = users.findIndex((user) => user.id === userId);

  if (typeof userIndex === 'undefined' || userIndex < 0) {
    res.send({
      code: 404,
      data: {},
      msg: '未找到该用户！',
    });
    return;
  }
  users.splice(userIndex, 1);
  addOperationLog(currentUser.username, currentUser.account, '删除用户');
  res.send({
    code: 0,
    data: {},
    msg: '删除用户成功',
  });
};
/** 获取所有操作日志 */
const getOperationLogs = async (req: Request, res: Response) => {
  const { current, pageSize, keyWords } = req.query;
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/log/list')) {
    res.status(401).send({ code: 1, msg: '您没有获取操作日志的权限！' });
    return;
  }
  let filteredLogs = logs;
  if (keyWords) {
    /** 根据关键词模糊匹配用户名和账号 */
    const keyword = keyWords.toString().toLowerCase();
    filteredLogs = logs.filter((log) => {
      const { username, account } = log;
      return username.toLowerCase().includes(keyword) || account.toLowerCase().includes(keyword);
    });
  }
  /** 将字符串类型的 page 和 pageSize 转换为数字类型 */
  const currentNumber = parseInt(current as string) || 1;
  const pageSizeNumber = parseInt(pageSize as string) || 10;
  /** 实现分页功能 */
  const startIndex = (currentNumber - 1) * pageSizeNumber;
  const endIndex = startIndex + parseInt(pageSize as string);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  addOperationLog(currentUser.username, currentUser.account, '获取操作日志');
  res.send({
    code: 0,
    data: {
      total: filteredLogs.length,
      list: paginatedLogs,
      current: currentNumber,
      pageSize: pageSizeNumber,
    },
    msg: '获取操作日志成功',
  });
};
/** 获取角色列表 */
const getRoleList = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/role/list')) {
    res.status(401).send({ code: 1, msg: '您没有获取角色列表的权限！' });
    return;
  }
  const { current, pageSize, name, startTime, endTime } = req.query;
  /** 将字符串类型的 page 和 pageSize 转换为数字类型 */
  const currentNumber = parseInt(current as string) || 1;
  const pageSizeNumber = parseInt(pageSize as string) || 10;
  /** 实现分页功能 */
  const startIndex = (currentNumber - 1) * pageSizeNumber;
  const endIndex = startIndex + pageSizeNumber;
  let filteredRoles = roles;
  if (name) {
    // 根据关键词模糊匹配角色名
    const keyword = name.toString().toLowerCase();
    filteredRoles = roles.filter((role) => role.name.toLowerCase().includes(keyword));
  }
  if (startTime && endTime) {
    // 根据创建时间或更新时间筛选角色对象
    filteredRoles = roles.filter((role) => {
      const createTime = new Date(role.createTime).getTime();
      const updateTime = new Date(role.updateTime).getTime();
      const start = new Date(startTime as string).getTime();
      const end = new Date(endTime as string).getTime();
      return (
        (start <= createTime && createTime <= end) || (start <= updateTime && updateTime <= end)
      );
    });
  }
  const roleList = filteredRoles.slice(startIndex, endIndex).map((role) => role);

  addOperationLog(currentUser.username, currentUser.account, '获取角色列表');
  res.send({
    code: 0,
    data: {
      total: filteredRoles.length,
      list: roleList,
      current: currentNumber,
      pageSize: pageSizeNumber,
    },
    msg: '获取角色列表成功',
  });
};
/** 添加角色 */
const addRole = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/role/add')) {
    res.status(401).send({ code: 1, msg: '您没有添加角色的权限！' });
    return;
  }
  const { name, permissions } = req.body;
  /** 判断有无参数 */
  if (!name || !permissions) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  /** 生成新用户 ID */
  const roleId = roles.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
  const newRole = {
    id: roleId,
    name,
    permissions,
    createTime: Mock.mock('@now'),
    updateTime: '',
  };
  roles.push(newRole);

  addOperationLog(currentUser.username, currentUser.account, `添加角色 ${name}`);
  res.send({
    code: 0,
    data: {},
    msg: '添加角色成功',
  });
};
/** 更新角色 */
const updateRole = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/role/update')) {
    res.status(401).send({ code: 1, msg: '您没有更新角色的权限！' });
    return;
  }
  const { id, name, permissions } = req.body;
  /** 判断有无参数 */
  if (!id || !name || !permissions) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  const roleIndex = roles.findIndex((role) => role.id === id);
  if (roleIndex === -1) {
    res.status(400).send({ code: 1, msg: '角色不存在！' });
    return;
  }
  roles[roleIndex] = {
    ...roles[roleIndex],
    name,
    permissions,
    updateTime: Mock.mock('@now'),
  };
  addOperationLog(currentUser.username, currentUser.account, `更新角色 ${name}`);
  res.send({
    code: 0,
    data: {},
    msg: '更新角色成功',
  });
};
/** 删除角色 */
const deleteRole = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/role/delete')) {
    res.status(401).send({ code: 1, msg: '您没有删除角色的权限！' });
    return;
  }
  const { id } = req.body;
  /** 判断有无参数 */
  if (!id) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  const roleIndex = roles.findIndex((role) => role.id === id);
  if (roleIndex === -1) {
    res.status(400).send({ code: 1, msg: '角色不存在！' });
    return;
  }
  const role = roles[roleIndex];
  roles.splice(roleIndex, 1);
  addOperationLog(currentUser.username, currentUser.account, `删除角色 ${role.name}`);
  res.send({
    code: 0,
    data: {},
    msg: '删除角色成功',
  });
};
/** 获取角色详情 */
const getRoleDetail = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/role/detail')) {
    res.status(401).send({ code: 1, msg: '您没有获取角色详情的权限！' });
    return;
  }
  const id = Number(req.query.id);
  /** 判断有无参数 */
  if (!id) {
    res.status(400).send({ code: 1, msg: '缺少必要参数！' });
    return;
  }
  const role = roles.find((role) => role.id === id);
  if (!role) {
    res.status(400).send({ code: 1, msg: '角色不存在！' });
    return;
  }
  /** 获取对应的权限名称 */
  const permissionNames = role.permissions.map((permissionId) => {
    const permission = permissions.find((p) => p.id === permissionId);
    return permission ? permission.name : '';
  });
  addOperationLog(currentUser.username, currentUser.account, `获取角色 ${role.name} 详情`);
  res.send({
    code: 0,
    data: {
      ...role,
      permissionNames,
    },
    msg: '获取角色详情成功',
  });
};
/** 获取权限列表 */
const getPermissionList = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/permission/list')) {
    res.status(401).send({ code: 1, msg: '您没有获取权限列表的权限！' });
    return;
  }
  addOperationLog(currentUser.username, currentUser.account, '获取权限列表');
  res.send({
    code: 0,
    data: {
      list: permissions,
    },
    msg: '获取权限列表成功',
  });
};
/** 获取上传参数 */
const getUploadParams = async (req: Request, res: Response) => {
  const currentUser = authenticateToken(req.headers['x-auth-token'] as string, res);
  if (!currentUser) return;
  if (!currentUser.permissions.includes('/upload/params')) {
    res.status(401).send({ code: 1, msg: '您没有上传文件的权限！' });
    return;
  }
  addOperationLog(currentUser.username, currentUser.account, '获取上传参数');
  res.send({
    code: 0,
    data: {
      channel: '',
      host: '',
      path: '',
      bucket: '',
      endPoint: '/api/upload/file',
      expiredTime: Mock.mock('@now("T")'),
      accessKeyId: '',
      accessKeySecret: '',
      securityToken: '',
    },
    msg: '获取上传参数成功',
  });
};
/** 上传文件 */
const uploadFile = async (req: Request, res: Response) => {
  await waitTime(1500);
  res.send({
    code: 0,
    data: {},
    msg: '上传成功',
  });
};
export default {
  'POST /api/login': login,
  'POST /api/logout': logout,
  'GET /api/region/list': getRegionList,
  'GET /api/user/list': getUserList,
  'GET /api/user/detail': getUserDetail,
  'POST /api/user/add': addUser,
  'POST /api/user/update': updateUser,
  'POST /api/user/delete': deleteUser,
  'GET /api/operation/log': getOperationLogs,
  'GET /api/role/list': getRoleList,
  'GET /api/role/detail': getRoleDetail,
  'POST /api/role/add': addRole,
  'POST /api/role/update': updateRole,
  'POST /api/role/delete': deleteRole,
  'GET /api/permission/list': getPermissionList,
  'GET /api/upload/params': getUploadParams,
  'POST /api/upload/file': uploadFile,
};
