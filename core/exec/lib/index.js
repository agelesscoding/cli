"use strict";

const path = require("path");
const colors = require("colors");
const log = require("@agelesscoding/log");
const Package = require("@agelesscoding/package");
const { exec: spawn } = require("@agelesscoding/utils");

module.exports = exec;

const SETTINGS = {
  init: "@agelesscoding/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  let pkg;
  let storeDir = "";
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();

  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    if (await pkg.exists()) {
      // 更新 package
      await pkg.update();
    } else {
      // 安装 package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
  }
  const rootFilePath = pkg.getRootFilePath();
  log.verbose("rootFilePath", rootFilePath);
  if (rootFilePath) {
    try {
      // require(rootFilePath).call(null, Array.from(arguments));
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null); // 创建一个没有原型链的对象
      Object.keys(cmd).forEach((key) => {
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith("_") &&
          key !== "parent"
        ) {
          o[key] = cmd[key];
        }
      });
      args[args.length - 1] = o;

      const code = `require('${rootFilePath}').call(null, ${JSON.stringify(
        args
      )})`;
      // windows 系统，使用 spawn 执行命令：cp.spawn("cmd", ["/c", "node", "-e", code], { cwd: process.cwd(), stdio: "inherit" });
      // 非 windows 系统，使用 spawn 执行命令
      const child = spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      child.on("error", (e) => {
        log.error(colors.red(e.message));
        process.exit(1);
      });
      child.on("exit", (e) => {
        log.verbose("命令执行成功：" + e);
        process.exit(e);
      });
    } catch (error) {
      log.error(error.message);
    }
  }
}
