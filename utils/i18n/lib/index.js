"use strict";

const i18next = require("i18next");
const en = require("./en.json");
const zhCN = require("./zh_CN.json");

i18next.init({
  lng: process.env.AGELESSCODING_CLI_LANG,
  resources: {
    en: { translation: en },
    zh_CN: { translation: zhCN },
  },
});

module.exports = i18next;
