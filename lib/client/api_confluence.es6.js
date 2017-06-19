// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('../confluence/api_velocity_data.es6.js');
require('../confluence/browser_metric_data.es6.js');

foam.CLASS({
  name: 'ApiConfluence',
  package: 'org.chromium.apis.web',
  implements: ['foam.mlang.Expressions'],

  documentation: `ApiConfluence is a client side object that
    has methods to retrieve confluence metrics from Rest DAO such
    as API velocity, failure-to-ship, aggressive removal and
    browser-specific-APIs.`,

  requires: [
    'foam.dao.ArraySink',
    'org.chromium.apis.web.BrowserMetricData',
    'org.chromium.apis.web.ApiVelocityData',
  ],
  imports: [
    'apiVelocityDAO',
    'failureToShipDAO',
    'browserSpecificDAO',
    'aggressiveRemovalDAO',
  ],

  methods: [
    {
      name: 'getApiVelocity',
      documentation: `Read from apiVelocityDAO and returns API velocity
          metric for each browser release.`,
      returns: {
        typeName: 'JSON',
        documentation: `JSON of the form:
            {browserName: [
              [ApiVelocityData, ...]
            ], ...}`,
      },
      code: function() {
        return this.apiVelocityDAO
            .select(this.GROUP_BY(
                this.ApiVelocityData.BROWSER_NAME,
                this.ArraySink.create()))
            .then((groups) => {
              let apiVelocityResult = {};
              for (let i = 0; i < groups.groupKeys.length; i++) {
                let browserName = groups.groupKeys[i];
                apiVelocityResult[browserName] =
                  groups.groups[browserName].a.map((apiVelocityData) => {
                    return {
                      releaseDate: apiVelocityData.releaseDate,
                      browserName: apiVelocityData.browserName,
                      browserVersion:
                          apiVelocityData.currRelease.browserVersion,
                      osName: apiVelocityData.currRelease.osName,
                      osVersion: apiVelocityData.currRelease.osVersion,
                      totalApis: apiVelocityData.totalApis,
                      newApis: apiVelocityData.newApis,
                      removedApis: apiVelocityData.removedApis,
                      prevRelease: apiVelocityData.prevRelease,
                      currRelease: apiVelocityData.currRelease,
                    };
                });
              }
              return apiVelocityResult;
            });
      },
    },
    {
      name: 'getFailureToShip',
      documentation: `Read from failure to ship DAO and return failure
          to ship metrics metric for each browser release.`,
      returns: {
        typeName: 'JSON',
        documentation: `JSON of the form:
            {browserName: [
              [BrowserMetricData<type=FAILURE_TO_SHIP>, ...]
            ], ...}`,
      },
      code: function() {
        return this.failureToShipDAO
            .orderBy(this.BrowserMetricData.DATE)
            .select(this.GROUP_BY(
                this.BrowserMetricData.BROWSER_NAME,
                this.ArraySink.create()))
            .then((groups) => {
              let failureToShipResult = {};
              groups.groupKeys.forEach((bName) => {
                failureToShipResult[bName] = groups.groups[bName].a;
              });
              return failureToShipResult;
            });
      },
    },
    {
      name: 'getBrowserSpecificApis',
      documentation: `Read from browser-specific API DAO and return
        browser-specific metrics for each browser release.`,
      returns: {
        typeName: 'JSON',
        documentation: `JSON of the form:
            {browserName:
              [BrowserMetricData<type=BROWSER_SPECIFIC>, ...]
             ...}`,
      },
      code: function() {
        return this.browserSpecificDAO
            .orderBy(this.BrowserMetricData.DATE)
            .select(this.GROUP_BY(
                this.BrowserMetricData.BROWSER_NAME,
                this.ArraySink.create()))
            .then((groups) => {
              let browserSpecificResult = {};
              groups.groupKeys.forEach((bName) => {
                browserSpecificResult[bName] = groups.groups[bName].a;
              });
              return browserSpecificResult;
            });
      },
    },
    {
      name: 'getAggressiveRemoval',
      documentation: `Read from aggressive removal DAO and return aggressive
        removal metrics for each browser release.`,
      returns: {
        typeName: 'JSON',
        documentation: `JSON of the form:
            {browserName:
              [BrowserMetricData<type=AGGRESSIVE_REMOVAL>, ...]
            }`,
      },
      code: function() {
        return this.aggressiveRemovalDAO
            .orderBy(this.BrowserMetricData.DATE)
            .select(this.GROUP_BY(
                this.BrowserMetricData.BROWSER_NAME,
                this.ArraySink.create()))
            .then((groups) => {
              let aggressiveRemovalResult = {};
              groups.groupKeys.forEach((bName) => {
                aggressiveRemovalResult[bName] = groups.groups[bName].a;
              });
              return aggressiveRemovalResult;
            });
      },
    },
  ],
});
