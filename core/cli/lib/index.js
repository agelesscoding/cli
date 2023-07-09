"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors");
const userHome = require("user-home");
const commander = require("commander");
const log = require("@agelesscoding/log");
const exec = require("@agelesscoding/exec");

const constant = require("./const");
const pkg = require("../package.json");

// 实例化 commander 对象
const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message);
    if (program.getOptionValue("debug")) console.log(error);
  }
}

// 注册命令
function registerCommand() {
  program
    .version(pkg.version)
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  program.on("option:debug", function () {
    const opts = this.opts();
    if (opts?.debug) process.env.LOG_LEVEL = "verbose";
    else process.env.LOG_LEVEL = "info";
    log.level = process.env.LOG_LEVEL;
  });

  // 设置 targetPath 环境变量
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.getOptionValue("targetPath");
  });

  //  监听未知命令
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error("未知的命令：" + obj[0]);
    if (availableCommands?.length > 0) {
      log.info("可用命令：" + availableCommands.join(","));
    }
  });

  // 打印帮助信息
  // if (process.argv?.length < 3) {
  //   program.outputHelp();
  // }

  program.parse(process.argv);

  if (!program?.args?.length) program.outputHelp();
}

async function prepare() {
  checkPkgVersion();
  await checkRoot();
  await checkUserHome();
  await checkEnv();
  await checkGlobalUpdate();
}

// 检查是否需要更新
async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2. 调用 npm API，获取最新的版本号，提示用户更新到该版本
  const { getNpmSemverVersion } = require("@agelesscoding/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "有新版本",
      colors.yellow(
        `请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}`
      )
    );
    log.warn("有新版本", colors.yellow(`更新命令：npm install -g ${npmName}`));
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

// 检查版本号
function checkPkgVersion() {
  log.notice("cli", pkg.version);
}
