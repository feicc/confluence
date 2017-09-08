// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

require('angular');

require('../chart/time_series_chart.es6.js');
require('../chart/api_velocity_chart.es6.js');
require('../chart/browser_metric_chart.es6.js');

angular.module('confluence')
  .controller('confluenceController', ['$scope', 'api', function($scope, api) {
    // No URL state for Confluence page.
    api.clearState();

    // Activate tabs.
    $('ul.tabs').tabs();
    $scope.showTab = 0;
    $scope.apiVelocityMetrics = {};
    $scope.browserMetric = null;
    $scope.failureToShipMetric = null;
    $scope.browserSpecificMetric = null;
    $scope.aggressiveRemovalMetric = null;
    $scope.additionalViews = [];
    let apiConfluence = api.apiConfluence;

    apiConfluence.getApiVelocity().then((apiVelocityMetrics) => {
      $scope.apiVelocityMetrics = apiVelocityMetrics;
      $scope.$apply();
    });

    apiConfluence.getFailureToShip().then((failureToShipMetric) => {
      $scope.failureToShipMetric = failureToShipMetric;
      $scope.$apply();
    });

    apiConfluence.getBrowserSpecificApis().then((browserSpecificMetric) => {
      $scope.browserSpecificMetric = browserSpecificMetric;
      $scope.$apply();
    });

    apiConfluence.getAggressiveRemoval()
      .then((aggressiveRemovalMetric) => {
        $scope.aggressiveRemovalMetric = aggressiveRemovalMetric;
      });

    function getTerseName(release) {
      const browserName = release.browserName.substr(0, 1);
      // TODO(markdittmer): We should have a more elegant solution for this, but
      // "'S'afari" is the only browser where minor version numbers matter.
      const browserVersion = browserName === 'S' ?
            release.browserVersion.split('.').slice(0, 2).join('.') :
            release.browserVersion.split('.')[0];
      return `${browserName}${browserVersion}`;
    }

    $scope.createNewDiffView = function(minuend, subtrahend) {
      let releaseOptions = {};
      releaseOptions[minuend.releaseKey] = true;
      releaseOptions[subtrahend.releaseKey] = false;
      $scope.additionalViews.push({
        label: `${getTerseName(minuend)} - ${getTerseName(subtrahend)}`,
        releases: [minuend, subtrahend],
        releaseOptions,
      });
    };
    $scope.newFailureToShipView = function(release, prevs, others, date) {
      let releaseOptions = {};
      let releases = [release].concat(prevs, others);
      releaseOptions[release.releaseKey] = false;
      for (let i = 0; i < prevs.length; i++) {
        releaseOptions[prevs[i].releaseKey] = false;
      }
      for (let i = 0; i < others.length; i++) {
        releaseOptions[others[i].releaseKey] = true;
      }
      $scope.additionalViews.push({
        label: `Missing(${getTerseName(release)}) on ${date.toISOString().split('T')[0]}`,
        releases,
        releaseOptions,
      });
    };
    $scope.newBrowserSpecificView = function(release, prevs, others, date) {
      let releaseOptions = {};
      let releases = [release].concat(prevs, others);
      releaseOptions[release.releaseKey] = true;
      for (let i = 0; i < prevs.length; i++) {
        releaseOptions[prevs[i].releaseKey] = true;
      }
      for (let i = 0; i < others.length; i++) {
        releaseOptions[others[i].releaseKey] = false;
      }
      $scope.additionalViews.push({
        label: `Alone(${getTerseName(release)}) on ${date.toISOString().split('T')[0]}`,
        releases,
        releaseOptions,
      });
    };
    $scope.newAggressiveRemovalView = function(releaseOneYearAgo,
                                               prevReleases, currReleases,
                                               date) {
      let releases = [releaseOneYearAgo].concat(
          prevReleases, currReleases);
      let releaseOptions = {};
      // Set release options to be false for releaseOneYearAgo and
      // true for all currReleases. And set numAvailable to be 1 +
      // currReleases.length to releases.length. So it returns
      // APIs that not exists in releaseOneYearAgo but avaiable
      // in all current Releases and some prevReleases;
      releaseOptions[releaseOneYearAgo.releaseKey] = false;
      for (let i = 0; i < currReleases.length; i++) {
        releaseOptions[currReleases[i].releaseKey] = true;
      }
      let numAvailable = [];
      for (let i = currReleases.length + 1; i <= releases.length; i++) {
        numAvailable.push(i);
      }
      $scope.additionalViews.push({
        label: `Removed(${getTerseName(releaseOneYearAgo)}) on ${date.toISOString().split('T')[0]}`,
        releases,
        releaseOptions,
        numAvailable,
      });
    };
  }]);
