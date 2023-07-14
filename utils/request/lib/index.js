"use strict";

const axios = require("axios");

// TODO 后期支持从 jsdelivr 获取（https://cdn.jsdelivr.net）
const BASE_URL =
  process.env.AGELESSCODING_CLI_BASE_URL || "https://api.github.com/repos";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// axios 拦截器中对 response 的处理
request.interceptors.response.use(
  (response) => {
    return JSON.parse(Buffer.from(response.data.content, "base64").toString());
  },
  (error) => Promise.reject(error)
);

module.exports = request;
