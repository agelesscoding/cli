"use strict";

const path = require("path");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");

const { isObject } = require("@agelesscoding/utils");
const formatPath = require("@agelesscoding/format-path");
const { getDefaultRegistry } = require("@agelesscoding/get-npm-info");

class Package {
  constructor(opts) {
    if (!opts) throw new Error("Package 类的 opts 参数不能为空！");
    if (!isObject(opts)) throw new Error("Package 类的 opts 参数必须为对象！");

    // package 的目标路径
    this.targetPath = opts.targetPath;
    // 缓存 package 的路径
    this.storeDir = opts.storeDir;
    // package 的 name
    this.packageName = opts.packageName;
    // package 的 version
    this.packageVersion = opts.packageVersion;
  }

  // 判断当前 Package 是否存在
  exists() {}

  // 安装 Package
  install() {
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  // 更新 Package
  update() {}

  // 获取入口文件的路径
  getRootFilePath() {
    // 1. 获取 package.json 所在目录
    const dir = pkgDir(this.targetPath);
    if (dir) {
      // 2. 读取 package.json - require()
      const pkgFile = require(path.resolve(dir, "package.json"));
      // 3. 寻找 main/lib
      if (pkgFile?.main) {
        // 4. 路径的兼容（macOS/windows）
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }
    return null;
  }
}

module.exports = Package;
