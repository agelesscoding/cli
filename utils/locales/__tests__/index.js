'use strict';

const locales = require('..');
const assert = require('assert').strict;

assert.strictEqual(locales(), 'Hello from locales');
console.info('locales tests passed');
