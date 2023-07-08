"use strict";

const { isObject } = require("@agelesscoding/utils");

class Package {
  constructor(opts) {
    if (!opts) throw new Error("Package 类的 opts 参数不能为空！");
    if (!isObject(opts)) throw new Error("Package 类的 opts 参数必须为对象！");

    console.log("Package Model", opts);
    // package 的路径
    this.targetPath = opts.targetPath;
    // package 的存储路径
    this.storePath = opts.storePath;
    // package 的 name
    this.packageName = opts.packageName;
    // package 的 version
    this.packageVersion = opts.packageVersion;
  }

  // 判断当前 Package 是否存在
  exists() {}

  // 安装 Package
  install() {}

  // 更新 Package
  update() {}

  // 获取入口文件的路径
  getRootFilePath() {}
}

module.exports = Package;
