"use strict";

const colors = require("colors");
const semver = require("semver");
const log = require("@agelesscoding/log");

const LOWEST_NODE_VERSION = "18.0.0"; // 最低 Node 版本号

class Command {
  constructor(argv) {
    if (!argv) throw new Error(colors.red("参数不能为空"));
    if (!Array.isArray(argv)) throw new Error(colors.red("参数必须为数组"));
    if (!argv?.length) throw new Error(colors.red("参数列表为空"));
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => {
        log.error(err.message);
      });
    });
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  // 检查 Node 版本
  checkNodeVersion() {
    // 1. 获取当前 node 版本号
    const currentVersion = process.version;
    // 2. 对比最低版本号
    const lowestVersion = LOWEST_NODE_VERSION;
    // 3. 如果当前版本号小于等于最低版本号，抛出异常
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(
          `agelesscoding 需要安装 v${lowestVersion} 以上版本的 Node.js`
        )
      );
    }
  }

  init() {
    throw new Error(colors.red("init 必须实现"));
  }

  exec() {
    throw new Error(colors.red("exec 必须实现"));
  }
}

module.exports = Command;
