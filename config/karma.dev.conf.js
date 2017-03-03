/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Run all tests in Karma continuously.

const base = require('./karma.conf.js');
const webpack = base.webpackConfig;
const files = base.deps
  .concat(base.helpers)
  .concat(base.units)
  .concat(base.integrations);
const wp = ['webpack'];
const preprocessors = {
  'browser/webpack-helper.js': wp,
};

module.exports = function(config) {
  base(config);
  config.set({
    files,
    preprocessors,
    webpack,
    singleRun: false,
    autoWatch: true,
  });
};
