"use strict";

const path = require("path");

module.exports = function formatPath(p) {
  if (typeof p === "string") {
    const sep = path.sep;
    if (sep === "/") return p;
    return p.replace(/\\/g, "/");
  }
  return p;
};
