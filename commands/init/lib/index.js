"use strict";

const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const colors = require("colors");
const semver = require("semver");
const log = require("@agelesscoding/log");
const Command = require("@agelesscoding/command");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

const InitCommand = class extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._argv[1]?.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  async exec() {
    const inquirer = (await import("inquirer")).default;
    this.inquirer = inquirer;
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
      let isContinue = false;
      // 1.1 询问是否继续创建
      if (!this.force) {
        isContinue = (
          await this.inquirer.prompt([
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
      // 2. 是否启动强制更新
      if (isContinue || this.force) {
        // 2.1 给用户做二次确认
        const { confirmDelete } = await this.inquirer.prompt([
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
    return this.getProjectInfo();
  }

  async getProjectInfo() {
    const projectInfo = {};
    // 1. 选择创建项目的类型
    const { type } = await this.inquirer.prompt({
      type: "list",
      name: "type",
      message: "请选择初始化项目类型",
      default: TYPE_PROJECT,
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    });

    if (type === TYPE_PROJECT) {
      // 2. 获取项目的基本信息
      const o = await this.inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "请输入项目名称",
          default: "",
          validate: function (v) {
            // Declare function as asynchronous, and save the done callback
            const done = this.async();

            // Do async stuff
            setTimeout(function () {
              // 1. 输入的首字符必须为英文字符
              // 2. 尾字符必须为英文或数字，不能为字符
              // 3. 字符仅允许"-_"
              // 4. 首尾字符不能为"-_"
              // Tip: \w => [a-zA-Z0-9_]
              // 合法：a, a-b, a_b, a-b_c, a_b-c, a1, a-b1-c1, a_b1_c1
              // 不合法：1, -a, _a, a-, a_, a-1, a_1, a-b-, a_b_, a-b1-c1-, a_b1_c1_
              if (
                !/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])/.test(
                  v
                )
              ) {
                // Pass the return value in the done callback
                done("请输入合法的项目名称");
                return;
              }
              // Pass the return value in the done callback
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: "input",
          name: "projectVersion",
          message: "请输入项目版本号",
          default: "1.0.0",
          validate: function (v) {
            // Declare function as asynchronous, and save the done callback
            const done = this.async();

            // Do async stuff
            setTimeout(function () {
              if (!!!semver.valid(v)) {
                // Pass the return value in the done callback
                done("请输入合法的项目名称");
                return;
              }
              // Pass the return value in the done callback
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return !!semver.valid(v) ? semver.valid(v) : v;
          },
        },
      ]);
      console.log("o", o);
    } else if (type === TYPE_COMPONENT) {
    } else {
    }
    log.verbose("type", type);
    // return 项目的基本信息（object）
    return projectInfo;
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
