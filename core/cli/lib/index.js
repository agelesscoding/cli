"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors");
const userHome = require("user-home");
const log = require("@agelesscoding/log");

const constant = require("./const");
const pkg = require("../package.json");

let args;

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    await checkRoot();
    await checkUserHome();
    checkInputArgs();
    log.verbose("debug", "test debug log");
    await checkEnv();
  } catch (error) {
    log.error(error.message);
  }
}

// 检查环境变量
async function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".agelesscoding");
  const pathExists = await import("path-exists");
  if (pathExists.pathExistsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
  }
  createDefaultConfig();
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

// 创建默认的配置文件
function createDefaultConfig() {
  const cliConfig = {
    home: userHome, // 用户主目录，如：/Users/agelesscoding（暂时用不到）
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查脚手架输入参数
function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs(args);
}

// 检查参数
function checkArgs(args) {
  if (args?.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
}

// 检查用户主目录
async function checkUserHome() {
  const pathExists = await import("path-exists");
  if (!userHome || !pathExists.pathExistsSync(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
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
  log.info("cli", pkg.version);
}

console.log("test");
