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
  } catch (error) {
    log.error(error.message);
  }
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
