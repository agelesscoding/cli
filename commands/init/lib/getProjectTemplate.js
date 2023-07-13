"use strict";

const request = require("@agelesscoding/request");

module.exports = function () {
  return request({
    url: "/gh/agelesscoding/cli-template@main/templates.json",
  });
};
