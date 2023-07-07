"use strict";

module.exports = core;

const semver = require("semver");
const colors = require("colors");
const log = require("@agelesscoding/log");

const pkg = require("../package.json");
const constant = require("./const");

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
  } catch (error) {
    log.error(error.message);
  }
}

// 检查 root 账户启动
async function checkRoot() {
  // process.getuid() 方法返回 Node.js 进程的数字标识符
  // - 如果当前进程以 root 用户身份运行，则返回 0；
  // - 如果当前进程以其他用户身份运行，则返回该用户的数字 ID；
  // - 如果当前操作系统不支持，则返回 undefined。
  const rootCheck = await import("root-check");
  rootCheck.default();
}

// 检查 Node 版本
function checkNodeVersion() {
  // 1. 获取当前 node 版本号
  const currentVersion = process.version;
  // 2. 对比最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  // 3. 如果当前版本号小于等于最低版本号，抛出异常
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`agelesscoding 需要安装 v${lowestVersion} 以上版本的 Node.js`)
    );
  }
}

// 检查版本号
function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
