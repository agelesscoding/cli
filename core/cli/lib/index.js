"use strict";

const pkg = require("../package.json");

module.exports = core;

function core() {
  checkPkgVersion();
}

function checkPkgVersion() {
  console.log(pkg.version);
}
