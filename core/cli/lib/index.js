"use strict";

const path = require("path");
const fse = require("fs-extra");
const i18n = require("i18next");
const colors = require("colors");
const dotenv = require("dotenv");
const semver = require("semver");
const commander = require("commander");
const { homedir: userHome } = require("os");

const log = require("@agelesscoding/log");
const exec = require("@agelesscoding/exec");
const locales = require("@agelesscoding/locales");

const constant = require("./const");
const pkg = require("../package.json");

const dotenvPath = path.resolve(userHome(), ".agelesscoding", ".env"); // 环境变量配置文件路径

// 实例化 commander 对象
const program = new commander.Command();

async function core() {
  try {
    await prepare();
    await registerI18n();
    registerCommand();
  } catch (error) {
    log.error(error.message);
    if (program.getOptionValue("debug")) console.log(error);
  }
}

// 注册 i18n
async function registerI18n() {
  await i18n.init({
    lng: process.env.AGELESSCODING_CLI_LANG,
    resources: {
      en: { translation: locales.en },
      zh_CN: { translation: locales.zhCN },
    },
  });
}

// 注册命令
function registerCommand() {
  program
    .version(pkg.version, "-V, --version", i18n.t("version"))
    .name(Object.keys(pkg.bin)[0])
    .alias(Object.keys(pkg.bin)[1])
    .usage("<command> [options]")
    .option("-d, --debug", i18n.t("debug"), false)
    .option(
      "-ltcp, --localTemplatesConfigPath <localTemplatesConfigPath>",
      i18n.t("localTemplatesConfigPath"),
      ""
    )
    .option("-tp, --targetPath <targetPath>", i18n.t("targetPath"), "")
    .helpOption("-h, --help", i18n.t("help"))
    .addHelpCommand("help [command]", i18n.t("showHelp"));

  program
    .command("init [projectName]")
    .description(i18n.t("init"))
    .option("-f, --force", i18n.t("force"))
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

  // 设置 localTemplatesConfigPath 环境变量
  program.on("option:localTemplatesConfigPath", function () {
    process.env.CLI_LOCAL_TEMPLATES_CONFIG_PATH = program.getOptionValue(
      "localTemplatesConfigPath"
    );
  });

  //  监听未知命令
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error(`${i18n.t("unknownCommand")}: ` + obj[0]);
    if (availableCommands?.length > 0) {
      log.info(
        `${i18n.t("availableCommands")}: ` + availableCommands.join(",")
      );
    }
  });

  program.parse(process.argv);

  if (!program?.args?.length) program.outputHelp();
}

async function prepare() {
  checkPkgVersion();
  await checkRoot();
  await checkUserHome();
  await checkConfigDir();
  await checkEnv();
  await checkLanguage();
  await checkGlobalUpdate();
}

// 选择语言
async function checkLanguage() {
  const env = dotenv.config({ path: dotenvPath });
  if (env.parsed?.AGELESSCODING_CLI_LANG) {
    // 将语言写入环境变量
    process.env.AGELESSCODING_CLI_LANG = env.parsed.AGELESSCODING_CLI_LANG;
    return;
  }

  const inquirer = (await import("inquirer")).default;
  const result = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "What language do you use?",
      default: "en",
      choices: [
        {
          name: "English",
          value: "en",
        },
        {
          name: "简体中文",
          value: "zh_CN",
        },
      ],
    },
  ]);
  // 将语言写入环境变量
  process.env.AGELESSCODING_CLI_LANG = result.language;
  // 将语言写入配置文件
  fse.appendFileSync(dotenvPath, `AGELESSCODING_CLI_LANG=${result.language}`);
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
      i18n.t("New version"),
      colors.yellow(
        `${i18n.t("pleaseUpdateManually")} ${npmName}, ${i18n.t(
          "currentVersion"
        )}: ${currentVersion}, ${i18n.t("latestVersion")}: ${lastVersion}`
      )
    );
    log.warn(
      i18n.t("New version"),
      colors.yellow(`${i18n.t("updateCommand")}: npm install -g ${npmName}`)
    );
  }
}

// 检查环境变量
async function checkEnv() {
  const pathExists = await import("path-exists");
  if (pathExists.pathExistsSync(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
  } else {
    fse.writeFileSync(dotenvPath, ""); // 创建默认的配置文件
  }
  createDefaultConfig(); // 将默认的配置写入环境变量
}

// 将默认的配置写入环境变量
function createDefaultConfig() {
  const cliConfig = {
    home: userHome(), // 用户主目录，如：/Users/agelesscoding（暂时用不到）
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome(), process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome(), constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// 检查脚手架配置目录
async function checkConfigDir() {
  const pathExists = await import("path-exists");
  const configDir = path.join(userHome(), constant.DEFAULT_CLI_HOME);
  if (!pathExists.pathExistsSync(configDir)) fse.mkdirpSync(configDir);
}

// 检查用户主目录
async function checkUserHome() {
  const pathExists = await import("path-exists");
  if (!userHome() || !pathExists.pathExistsSync(userHome())) {
    throw new Error(colors.red(`${i18n.t("homeDirNotExist")}!`));
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

module.exports = core;
