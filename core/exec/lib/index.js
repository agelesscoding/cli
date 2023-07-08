"use strict";

const log = require("@agelesscoding/log");
const Package = require("@agelesscoding/package");

module.exports = exec;

const SETTINGS = {
  init: "@agelesscoding/init",
};

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();

  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  const pkg = new Package({ targetPath, packageName, packageVersion });
}
