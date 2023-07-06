'use strict';

const utils = require('@agelesscoding/utils');
const { log } = require('npmlog');

function core() {
  utils();
  log('info', 'Hello world, again and again!');
  return 'Hello from core';
}

module.exports = core;
