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

module.exports = { isObject, spinnerStart, sleep };
