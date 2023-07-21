"use strict";

const request = require("@agelesscoding/request");

// TODO 后期支持从 jsdelivr 获取（/gh/agelesscoding/cli-template@main/templates.json）

module.exports = function () {
  const localTemplatesConfigPath = process.env.CLI_LOCAL_TEMPLATES_CONFIG_PATH;
  const remoteTemplatesConfigPath =
    process.env.CLI_REMOTE_TEMPLATES_CONFIG_PATH;
  if (localTemplatesConfigPath) {
    return require(localTemplatesConfigPath);
  } else if (remoteTemplatesConfigPath) {
    return request.axios
      .get(remoteTemplatesConfigPath)
      .then((res) => res?.data || []);
  } else {
    return request({
      url: "/agelesscoding/cli-template/contents/templates.json",
    });
  }
};
