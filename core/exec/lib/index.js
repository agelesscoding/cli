"use strict";

const Package = require("@agelesscoding/package");

module.exports = exec;

function exec(projectName, cmdOjb) {
  const pkg = new Package();
  console.log("pkg", pkg);
  console.log("from exec:", process.env.CLI_TARGET_PATH);
}
