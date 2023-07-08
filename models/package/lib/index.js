"use strict";

const path = require("path");
const fse = require("fs-extra");
const semver = require("semver");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");

const { isObject } = require("@agelesscoding/utils");
const formatPath = require("@agelesscoding/format-path");
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require("@agelesscoding/get-npm-info");

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

  async prepare() {
    const pathExists = await import("path-exists");
    if (this.storeDir && pathExists.pathExistsSync(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }

  // 获取缓存路径
  get cacheFilePath() {
    return path.resolve(this.storeDir, this.packageName);
  }

  // 获取当前 package 的版本号
  get currentPackageVersion() {
    // 1. 读取当前 npm 模块的 package.json 文件
    const currentPkgPath = path.resolve(
      this.storeDir,
      this.packageName,
      "package.json"
    );
    // 2. 读取 package.json 文件内容
    const currentPkgFile = require(currentPkgPath);
    // 3. 返回版本号
    return currentPkgFile.version;
  }

  // 判断当前 Package 是否存在
  async exists() {
    const pathExists = await import("path-exists");
    if (this.storeDir) {
      await this.prepare();
      return pathExists.pathExistsSync(this.cacheFilePath);
    } else {
      return pathExists.pathExistsSync(this.targetPath);
    }
  }

  // 安装 Package
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  // 更新 Package
  async update() {
    await this.prepare();
    // 1. 获取最新的 npm 模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    // 2. 查询当前 npm 模块版本号
    const currentPackageVersion = this.currentPackageVersion;
    // 3. 如果最新版本号大于当前版本号，更新 npm 模块
    if (semver.gt(latestPackageVersion, currentPackageVersion)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: latestPackageVersion }],
      });
      this.packageVersion = latestPackageVersion;
    }
  }

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
