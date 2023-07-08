"use strict";

const path = require("path");

const log = require("@agelesscoding/log");
const Package = require("@agelesscoding/package");

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
      console.log("更新 package");
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
  console.log("pkg exists", await pkg.exists());
  const rootFilePath = pkg.getRootFilePath();
  if (rootFilePath) require(rootFilePath).apply(null, arguments);
}
