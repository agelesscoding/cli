"use strict";

const axios = require("axios");
const { error } = require("npmlog");

const BASE_URL =
  process.env.AGELESSCODING_CLI_BASE_URL || "https://cdn.jsdelivr.net";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// axios 拦截器中对 response 的处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

module.exports = request;
