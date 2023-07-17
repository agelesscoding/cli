"use strict";

const fs = require("fs");
const ejs = require("ejs");
const path = require("path");
const fse = require("fs-extra");
const colors = require("colors");
const semver = require("semver");
const { globSync } = require("glob");
const { homedir: userHome } = require("os");

const log = require("@agelesscoding/log");
const i18n = require("@agelesscoding/i18n");
const Command = require("@agelesscoding/command");
const Package = require("@agelesscoding/package");
const { spinnerStart, sleep, execAsync } = require("@agelesscoding/utils");

const getProjectTemplate = require("./getProjectTemplate");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";
const TEMPLATE_TYPE_NORMAL = "normal"; // 标准模板
const TEMPLATE_TYPE_CUSTOM = "custom"; // 自定义模板
const WHITE_COMMAND = ["npm", "cnpm"]; // 白名单命令

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
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 2. 下载模板
        log.verbose("projectInfo", projectInfo);
        this.projectInfo = projectInfo;
        await this.downloadTemplate();
        // 3. 安装模板
        await this.installTemplate();
      }
    } catch (error) {
      log.error(colors.red(error.message));
      if (process.env.LOG_LEVEL === "verbose") console.log(error);
    }
  }

  async installTemplate() {
    log.verbose("templateInfo", this.templateInfo);
    if (this?.templateInfo) {
      if (!this.templateInfo?.type) {
        this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
      }
      if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
        // 标准安装
        await this.installNormalTemplate();
      } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
        // 自定义安装
        await this.installCustomTemplate();
      } else {
        throw new Error(
          colors.red(`${i18n.t("unrecognizedProjectTemplateType")}!`)
        );
      }
    } else {
      throw new Error(colors.red(`${i18n.t("projectTemplateInfoNotExist")}!`));
    }
  }

  async execCommand(command, errMsg) {
    let result;
    if (command && command.length > 0) {
      const cmdArray = command.split(" ");

      const cmd = this.checkCommand(cmdArray[0]);
      if (!cmd) {
        throw new Error(colors.red(`${i18n.t("commandNotExist")}: ${command}`));
      }

      const args = cmdArray.slice(1);
      result = await execAsync(cmd, args, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    }
    if (result !== 0) {
      throw new Error(colors.red(errMsg));
    }
    return result;
  }

  // 模板渲染
  async ejsRender(opts) {
    const dir = process.cwd();
    const files = globSync("**", {
      cwd: dir,
      ignore: opts.ignore || "",
      nodir: true,
    });

    Promise.all(
      files.map((file) => {
        const filePath = path.join(dir, file);
        return new Promise((resolve1, reject1) => {
          ejs.renderFile(filePath, this.projectInfo, (err, result) => {
            if (err) {
              reject1(err);
            } else {
              fse.writeFileSync(filePath, result);
              resolve1(result);
            }
          });
        });
      })
    )
      .then()
      .catch((err) => {
        throw err;
      });
  }

  // 安装标准模板
  async installNormalTemplate() {
    log.verbose("templateNpm", this.templateNpm);

    // 1. 拷贝模板代码至当前目录
    const spinner = spinnerStart(`${i18n.t("installingTemplate")}...`);
    await sleep(); // 中断 1s，让用户看到安装的效果

    try {
      const templatePath = path.resolve(
        this.templateNpm.cacheFilePath,
        "template"
      );
      const targetPath = process.cwd(); // 当前进程执行时所在的目录

      fse.ensureDirSync(templatePath); // 确保模板目录存在（注意：这里的模板目录是一个软连接目录）
      fse.ensureDirSync(targetPath); // 确保目标目录存在
      // 将模板目录下的文件拷贝到当前目录
      fse.copySync(templatePath, targetPath, {
        // 复制过程中，软链接会被解引用，也就是说，复制的是软链接指向的实际文件或目录，而不是软链接本身
        dereference: true, // 拷贝软链接
      });
      // 删除目标目录下的 node_modules
      if (fse.pathExistsSync(path.resolve(targetPath, "node_modules"))) {
        fse.removeSync(path.resolve(targetPath, "node_modules"));
      }
    } catch (error) {
      throw error;
    } finally {
      spinner.stop(true);
      log.success(i18n.t("installTemplateSuccess"));
    }

    const templateIgnore = this.templateInfo.ignore || [];
    const ignore = ["**/node_modules/**", ...templateIgnore];
    await this.ejsRender({ ignore }); // 模板渲染

    // 2. 依赖安装
    if (!this.templateInfo.installCommand) {
      log.success(colors.bold(colors.green(`${i18n.t("projectReady")} ;-)`)));
      return;
      this.templateInfo.installCommand = "npm install"; // 默认使用 npm 安装依赖
    } else {
      const { installCommand } = this.templateInfo;
      await this.execCommand(
        installCommand,
        `${i18n.t("dependencyInstallFail")}!`
      );
    }

    // 3. 启动命令执行
    if (!this.templateInfo.startCommand) {
      return;
      this.templateInfo.startCommand = "npm run serve"; // 默认使用 npm run serve 启动项目
    } else {
      const { startCommand } = this.templateInfo;
      await this.execCommand(
        startCommand,
        `${i18n.t("startCommandExecuteFail")}!`
      );
    }
  }

  // 检查命令是否存在白名单中
  checkCommand(cmd) {
    if (WHITE_COMMAND.includes(cmd)) return cmd;
    return null;
  }

  // 安装自定义模板
  async installCustomTemplate() {
    // 查询自定义模板入口文件路径
    if (await this.templateNpm.exists()) {
      const rootFile = this.templateNpm.getRootFilePath();
      if (fs.existsSync(rootFile)) {
        log.notice(`${i18n.t("startExecuteCustomTemplate")}...`);
        const templatePath = path.resolve(
          this.templateNpm.cacheFilePath,
          "template"
        );
        const options = {
          templateInfo: this.templateInfo,
          projectInfo: this.projectInfo,
          sourcePath: templatePath,
          targetPath: process.cwd(),
        };
        const code = `require('${rootFile}')(${JSON.stringify(options)})`;
        log.verbose(
          `${i18n.t("startExecuteCustomTemplateEntry")} - code`,
          code
        );
        await execAsync("node", ["-e", code], {
          stdio: "inherit",
          cwd: process.cwd(),
        });
        log.success(i18n.t("customTemplateExecuteSuccess"));
      } else {
        throw new Error(colors.red(`${i18n.t("customTemplateEntryNotExist")}`));
      }
    }
  }

  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate
    );
    this.templateInfo = templateInfo;
    const targetPath = path.resolve(userHome(), ".agelesscoding", "templates");
    const storeDir = path.resolve(
      userHome(),
      ".agelesscoding",
      "templates",
      "node_modules"
    );
    const { npmName, version } = templateInfo;
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });
    log.verbose("templateNpm", templateNpm);
    if (!(await templateNpm.exists())) {
      const spinner = spinnerStart(`${i18n.t("downloadingTemplate")}...`);
      await sleep(); // 中断 1s，让用户看到下载的效果
      try {
        await templateNpm.install();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists())
          log.success(i18n.t("downloadTemplateSuccess"));
        this.templateNpm = templateNpm; // 缓存模板模块
      }
    } else {
      const spinner = spinnerStart(`${i18n.t("updatingTemplate")}...`);
      await sleep(); // 中断 1s，让用户看到下载的效果
      try {
        await templateNpm.update();
      } catch (error) {
        throw error;
      } finally {
        spinner.stop(true);
        if (await templateNpm.exists()) {
          log.success(i18n.t("updateTemplateSuccess"));
        }
        this.templateNpm = templateNpm; // 缓存模板模块
      }
    }
  }

  async prepare() {
    // 0. 判断项目模板是否存在
    const template = await getProjectTemplate();
    if (!template || template.length === 0) {
      throw new Error(colors.red(`${i18n.t("projectTemplateNotExist")}!`));
    }
    this.template = template;
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
              message: i18n.t("continueCreateDirConfirm"),
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
            message: i18n.t("emptyDirConfirm"),
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
    let projectInfo = {};
    // 1. 选择创建项目的类型
    const { type } = await this.inquirer.prompt({
      type: "list",
      name: "type",
      message: i18n.t("selectProjectType"),
      default: TYPE_PROJECT,
      choices: [
        {
          name: i18n.t("project"),
          value: TYPE_PROJECT,
        },
        {
          name: i18n.t("component"),
          value: TYPE_COMPONENT,
        },
      ],
    });

    log.verbose("type", type);

    this.template = this.template.filter((template) => {
      return template.tag.includes(type);
    });

    const title =
      type === TYPE_PROJECT ? i18n.t("project") : i18n.t("component");

    let project = {};
    function isValidName(v) {
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])/.test(
        v
      );
    }
    const projectNamePrompt = {
      type: "input",
      name: "projectName",
      message: i18n.t("enterProjectName", { title: title.toLowerCase() }),
      default: type === TYPE_PROJECT ? "project" : "component",
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
          if (!isValidName(v)) {
            // Pass the return value in the done callback
            done(
              i18n.t("enterValidProjectName", { title: title.toLowerCase() })
            );
            return;
          }
          // Pass the return value in the done callback
          done(null, true);
        }, 0);
      },
      filter: function (v) {
        return v;
      },
    };
    const projectVersionPrompt = {
      type: "input",
      name: "projectVersion",
      message: i18n.t("enterProjectVersion", { title: title.toLowerCase() }),
      default: "1.0.0",
      validate: function (v) {
        // Declare function as asynchronous, and save the done callback
        const done = this.async();

        // Do async stuff
        setTimeout(function () {
          if (!!!semver.valid(v)) {
            // Pass the return value in the done callback
            done(
              i18n.t("enterValidProjectVersion", { title: title.toLowerCase() })
            );
            return;
          }
          // Pass the return value in the done callback
          done(null, true);
        }, 0);
      },
      filter: function (v) {
        return !!semver.valid(v) ? semver.valid(v) : v;
      },
    };
    const projectTemplatePrompt = {
      type: "list",
      name: "projectTemplate",
      message: i18n.t("selectProjectTemplate", { title: title.toLowerCase() }),
      choices: this.createTemplateChoices(),
    };

    if (type === TYPE_PROJECT) {
      // 2. 获取项目的基本信息
      if (isValidName(this.projectName)) {
        project = await this.inquirer.prompt([
          projectVersionPrompt,
          projectTemplatePrompt,
        ]);
        project.projectName = this.projectName;
      } else {
        project = await this.inquirer.prompt([
          projectNamePrompt,
          projectVersionPrompt,
          projectTemplatePrompt,
        ]);
      }
      projectInfo = { type, ...project };
    } else if (type === TYPE_COMPONENT) {
      const descriptionPrompt = {
        type: "input",
        name: "componentDescription",
        message: i18n.t("enterDescription"),
        default: "component description",
        validate: function (v) {
          // Declare function as asynchronous, and save the done callback
          const done = this.async();

          // Do async stuff
          setTimeout(function () {
            if (!v) {
              // Pass the return value in the done callback
              done(i18n.t("请输入描述信息"));
              return;
            }
            // Pass the return value in the done callback
            done(null, true);
          }, 0);
        },
      };
      project = await this.inquirer.prompt([
        projectNamePrompt,
        projectVersionPrompt,
        descriptionPrompt,
        projectTemplatePrompt,
      ]);
      projectInfo = { type, ...project };
    } else {
      projectInfo = { type };
    }

    if (projectInfo.projectName) {
      projectInfo.pkgName = require("kebab-case")(
        projectInfo.projectName
      ).replace(/^-/, "");
    }
    if (projectInfo.projectVersion) {
      projectInfo.pkgVersion = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.pkgDescription = projectInfo.componentDescription;
    }
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

  // 创建项目模板的选择列表
  createTemplateChoices() {
    function getTemplateName(name) {
      if (typeof name === "string") return name;
      if (Object.prototype.toString.call(name) === "[object Object]") {
        const CLI_LANG = process.env.AGELESSCODING_CLI_LANG;
        return name[CLI_LANG];
      }
    }
    return this.template.map((item) => ({
      value: item.npmName,
      name: getTemplateName(item.name),
    }));
  }
};

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
