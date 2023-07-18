#! /usr/bin/env node

const importLocal = require("import-local");

if (importLocal(__filename)) {
  require("npmlog").info("cli", "欢迎使用 @agelesscoding/cli 业务脚手架");
} else {
  require("../lib")(process.argv.slice(2));
}
