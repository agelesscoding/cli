"use strict";

const fs = require("fs");
const path = require("path");
const colors = require("colors");
const log = require("@agelesscoding/log");
const Command = require("@agelesscoding/command");

const InitCommand = class extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._argv[1]?.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    console.log("TODO: exec 的业务逻辑");
    try {
      // 1. 准备阶段
      this.prepare();
      // 2. 下载模板
      // 3. 安装模板
    } catch (error) {
      log.error(colors.red(error.message));
    }
  }

  prepare() {
    // 1. 判断当前目录是否为空
    if (!this.isCwnEmpty()) {
      // 1.1 询问是否继续创建
      console.log("当前目录不为空，是否继续创建？");
    }

    // 2. 是否启动强制更新
    // 3. 选择创建项目的类型
    // 4. 获取项目的基本信息
  }

  // 判断当前目录是否为空
  isCwnEmpty() {
    const localPath = process.cwd(); // 获取当前命令执行时所在的目录，也可以使用 path.resolve(".") 获取
    const fileList = fs
      .readdirSync(localPath)
      // 文件过滤逻辑
      .filter(
        (file) => !file.startsWith(".") && ["node_modules"].indexOf(file) < 0
      );
    return !fileList || fileList.length <= 0;
  }
};

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
