"use strict";

const request = require("@agelesscoding/request");

// TODO 后期支持从 jsdelivr 获取（/gh/agelesscoding/cli-template@main/templates.json）

module.exports = function () {
  return request({
    url: "/agelesscoding/cli-template/contents/templates.json",
  });
};
