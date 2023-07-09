"use strict";

const log = require("@agelesscoding/log");
const Command = require("@agelesscoding/command");

const InitCommand = class extends Command {
  init() {
    this.projectName = this._argv[0] || "";
    this.force = !!this._argv[1]?.force;
    log.verbose("projectName", this.projectName);
    log.verbose("force", this.force);
  }

  exec() {
    console.log("TODO: exec 的业务逻辑");
  }
};

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;

module.exports.InitCommand = InitCommand;
