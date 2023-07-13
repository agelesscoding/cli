"use strict";

const Spinner = require("cli-spinner").Spinner;

// 判断是否为对象
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

function spinnerStart(msg = "loading...", spinnerString = "|/-\\") {
  const spinner = new Spinner(`${msg} %s`);
  spinner.setSpinnerString(spinnerString);
  spinner.start(true);
  return spinner;
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

// 兼容 windows 系统和 linux 系统
function exec(command, args, options) {
  const win32 = process.platform === "win32";
  const cmd = win32 ? "cmd" : command;
  const cmdArgs = win32 ? ["/c"].concat(command, args) : args;
  return require("child_process").spawn(cmd, cmdArgs, options || {});
}

async function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    // 进程执行过程中，如果发生错误，就会触发 error 事件
    p.on("error", (e) => {
      reject(e);
    });
    // 进程退出时，表示命令执行成功
    p.on("exit", (c) => {
      resolve(c);
    });
  });
}

module.exports = { isObject, spinnerStart, sleep, exec, execAsync };
