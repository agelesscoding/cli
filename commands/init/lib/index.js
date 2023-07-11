"use strict";

const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
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

  async exec() {
    try {
      // 1. 准备阶段
      const ret = await this.prepare();
      console.log("ret", ret);
      if (ret) {
        // 2. 下载模板
        // 3. 安装模板
      }
    } catch (error) {
      log.error(colors.red(error.message));
    }
  }

  async prepare() {
    // 1. 判断当前目录是否为空
    const localPath = process.cwd(); // 获取当前命令执行时所在的目录，也可以使用 path.resolve(".") 获取
    if (!this.isDirEmpty(localPath)) {
      const inquirer = (await import("inquirer")).default;
      let isContinue = false;
      // 1.1 询问是否继续创建
      if (!this.force) {
        isContinue = (
          await inquirer.prompt([
            {
              type: "confirm",
              name: "isContinue",
              default: false,
              message: "当前文件夹不为空，是否继续创建项目？",
            },
          ])
        ).isContinue;
        if (!isContinue) return;
      }
      if (isContinue || this.force) {
        // 1.2 给用户做二次确认
        const { confirmDelete } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirmDelete",
            default: false,
            message: "是否确认清空当前目录下的文件？",
          },
        ]);
        if (confirmDelete) {
          // 1.3 清空当前目录
          fse.emptyDirSync(localPath);
        }
      }
    }
    // 2. 是否启动强制更新
    // 3. 选择创建项目的类型
    // 4. 获取项目的基本信息
  }

  // 判断当前目录是否为空
  isDirEmpty(localPath) {
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
