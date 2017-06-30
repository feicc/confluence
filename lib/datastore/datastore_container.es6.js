// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

require('../confluence/api_velocity_data.es6.js');
require('../confluence/browser_metric_data.es6.js');
require('../dao_container.es6.js');
require('../web_apis/release.es6.js');
require('../web_apis/release_interface_relationship.es6.js');
require('../web_apis/web_interface.es6.js');

foam.CLASS({
  name: 'DatastoreContainer',
  package: 'org.chromium.apis.web',
  extends: 'org.chromium.apis.web.DAOContainer',

  documentation: `Controller acting as container for datastore context. Note
      that this is component is Node JS-only because it requires
      com.google.net.node.Google2LOAuthAgent.`,

  requires: [
    'com.google.cloud.datastore.BatchMutationDatastoreDAO',
    'com.google.net.node.Google2LOAuthAgent',
    'foam.dao.NoDisjunctionDAO',
    'foam.log.ConsoleLogger',
    'org.chromium.apis.web.ApiVelocityData',
    'org.chromium.apis.web.BrowserMetricData',
    'org.chromium.apis.web.Release',
    'org.chromium.apis.web.ReleaseWebInterfaceJunction',
    'org.chromium.apis.web.WebInterface',
  ],
  exports: ['gcloudProjectId'],

  classes: [
    {
      name: 'HTTPRequest',
      extends: 'foam.net.BaseHTTPRequest',

      documentation: `Wrapper class for defining HTTPRequest delegate chain
          under this controller. The desired chain is as follows:

          RetryHTTPRequest
              -> (agent-contextualized) AuthHTTPRequest
              -> (default) HTTPRequest.

          When no authAgent is specified, the AuthHTTPRequest is left out.

          This ensures that requests that fail at the service level will be
          retried a reasonable number of times, and that all requests requiring
          credentials are appropriately authorized.`,

      requires: [
        'foam.net.BaseHTTPRequest',
        'foam.net.RetryHTTPRequest',
      ],
      imports: [ 'authAgent?' ],

      properties: [
        {
          class: 'Proxy',
          of: 'foam.net.BaseHTTPRequest',
          name: 'delegate',
          factory: function() {
            var BaseHTTPRequest = this.BaseHTTPRequest;
            var RetryHTTPRequest = this.RetryHTTPRequest;

            var baseProps = {};
            this.BaseHTTPRequest.getAxiomsByClass(foam.core.Property)
                .forEach(prop => baseProps[prop.name] = this[prop.name]);

            var next = BaseHTTPRequest.create(baseProps, this);
            if (this.authAgent) {
              var AuthHTTPRequest =
                  this.authAgent.__subContext__.lookup('foam.net.HTTPRequest');
              next = AuthHTTPRequest.create(Object.assign({}, baseProps, {
                delegate: next,
              }), this);
            }

            return RetryHTTPRequest.create(Object.assign({}, baseProps, {
              delegate: next
            }), this);
          }
        },
      ],

      methods: [
        function init() {
          this.validate();
          this.SUPER();
        },
      ],
    }
  ],

  properties: [
    {
      class: 'String',
      documentation: `Email account used to authenticate against Google Cloud
          services.`,
      name: 'gcloudAuthEmail',
      required: true
    },
    {
      class: 'String',
      documentation: `Private key used to authenticate against Google Cloud
          services.`,
      name: 'gcloudAuthPrivateKey',
      required: true
    },
    {
      class: 'String',
      documentation: 'Google Cloud Project ID for Datastore deployment.',
      name: 'gcloudProjectId',
      value: 'web-confluence',
    },
    {
      name: 'ctx',
      documentation: 'Context in which components are created',
      factory: function() {
        // Cascade exports from logger and authAgent into context.
        var ctx = this.__subContext__.createSubContext(this.logger);
        if (!this.authAgent) return ctx;

        ctx = ctx.createSubContext(this.authAgent);
        ctx.register(this.HTTPRequest, 'foam.net.HTTPRequest');
        return ctx;
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.log.Logger',
      name: 'logger',
      factory: function() { return this.ConsoleLogger.create(); },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.net.auth.AuthAgent',
      name: 'authAgent',
      factory: function() {
        return this.Google2LOAuthAgent.create({
          requiresAuthorization: function(request) {
            if (request.url) request = request.fromUrl(request.url);
            return request.protocol === 'https' &&
                request.hostname === 'datastore.googleapis.com';
          },
          email: this.gcloudAuthEmail,
          privateKey: this.gcloudAuthPrivateKey,
          scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/datastore'
          ],
        });
      },
    },
    {
      name: 'daoContainer',
      factory: function() {
        return this.DAOContainer.create({
        });
      },
    },
    {
      name: 'releaseDAO',
      factory: function() {
        return this.datastoreDAO_(this.Release);
      },
    },
    {
      name: 'webInterfaceDAO',
      factory: function() {
        return this.datastoreDAO_(this.WebInterface);
      },
    },
    {
      name: 'releaseWebInterfaceJunctionDAO',
      factory: function() {
        return this.datastoreDAO_(this.ReleaseWebInterfaceJunction);
      },
    },
    {
      name: 'browserMetricsDAO',
      factory: function() {
        return this.datastoreDAO_(this.BrowserMetricData);
      },
    },
    {
      name: 'apiVelocityDAO',
      factory: function() {
        return this.datastoreDAO_(this.ApiVelocityData);
      },
    },
  ],

  methods: [
    function datastoreDAO_(ofCls) {
      return this.NoDisjunctionDAO.create({
        delegate: this.BatchMutationDatastoreDAO.create({
          of: ofCls,
        }, this.ctx),
      }, this.ctx);
    }
  ],
});
