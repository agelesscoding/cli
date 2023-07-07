"use strict";

const log = require("npmlog");

// 修改前缀
log.heading = "AgelessCoding";
log.headingStyle = { fg: "white", bg: "black" };

// 判断 debug 模式
log.level = process.env.LOG_LEVEL || "info";

// 添加自定义命令
log.addLevel("success", 2000, { fg: "green", bold: true });

module.exports = log;
