"use strict";

module.exports = core;

const log = require("@agelesscoding/log");

const pkg = require("../package.json");

function core() {
  checkPkgVersion();
}

function checkPkgVersion() {
  console.log(pkg.version);
  log.notice("cli", pkg.version);
}
