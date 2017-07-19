// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  name: 'DAOContainer',
  package: 'org.chromium.apis.web',

  documentation: `Container for contextualizing related DAOs:

  Release,
  WebInterface,
  Release <--> WebInterface (ReleaseWebInterfaceJunction),
  BrowserMetricData (aggressive removal, browser-specific, etc.),
  ApiVelocityData (total APIs, new APIs, removed APIs).`,

  exports: [
    'apiVelocityDAO',
    'browserMetricsDAO',
    'releaseDAO',
    'releaseWebInterfaceJunctionDAO',
    'webInterfaceDAO',
  ],

  // Names applied to DAOs on both ends of WebSocket. These names are
  // consolidated here to ensure that they match on the web client and front end
  // server.
  constants: {
    RELEASE_NAME: 'releaseDAO',
    WEB_INTERFACE_NAME: 'webInterfaceDAO',
    RELEASE_WEB_INTERFACE_JUNCTION_NAME: 'releaseWebInterfaceJunctionDAO',
    API_VELOCITY_NAME: 'apiVelocityDAO',
    FAILURE_TO_SHIP_NAME: 'failureToShipDAO',
    BROWSER_SPECIFIC_NAME: 'browserSpecificDAO',
    AGGRESSIVE_REMOVAL_NAME: 'aggressiveRemovalDAO',
    // Name for single Worker box context.
    WORKER_BOX_CONTEXT_NAME: '/worker',
    // Name for Box service used to signal new data between pages/workers.
    NEW_DATA_SERVICE_NAME: 'newData',
  },

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      documentation: 'DAO providing access to all known browser releases.',
      name: 'releaseDAO',
      required: true,
      final: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      documentation: 'DAO providing access to all known web APIs.',
      name: 'webInterfaceDAO',
      required: true,
      final: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      documentation: `DAO providing access to all browser release <--> API
          relations.`,
      name: 'releaseWebInterfaceJunctionDAO',
      required: true,
      final: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      documentation: `DAO providing access to historical browser metrics data.`,
      name: 'browserMetricsDAO',
      required: true,
      final: true,
    },
    {
      class: 'foam.dao.DAOProperty',
      documentation: `DAO providing access to API Velocity metric data.`,
      name: 'apiVelocityDAO',
      required: true,
      final: true,
    },
  ],

  methods: [
    function init() {
      this.validate();
      this.SUPER();
    },
  ],
});
