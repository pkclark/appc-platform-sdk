'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const request = require('request');

const Appc = require('.');

module.exports = Session;

/**
 * Session object
 * @param {string} host - host
 * @param {string} subdomain - subdomain
 */
function Session(host, subdomain) {
	this.jar = request.jar();
	this.host = host;
	this.subdomain = subdomain;
}

/**
 * return true if session is valid
 *
 * @return {boolean} session is valid
 */
Session.prototype.isValid = function isValid() {
	return !!(this.jar && this.user && this.id);
};

/**
 * Invalidate the session
 */
Session.prototype.invalidate = function invalidate(cb) {
	if (this.isValid()) {
		Appc.Auth.invalidCachedSession(this);
		Appc.Auth.logout(this, cb);
	}
};

/**
 * Set session information
 *
 * @param {Object} body - body
 */
Session.prototype._set = function (body) {
	this.id = body['connect.sid'] || body['dashboard.sid'] || body.sid;
	this.user = {
		username: body.username,
		email: body.email || body.username,
		phone: body.phone,
		guid: body.guid || body.user_guid,
		org_id: body.org_id
	};
	this.soastaUrl = body.concerto || body.soastaUrl;
	this.touchtest = body.touchtest;
	return this;
};

/**
 * Invalidate session
 */
Session.prototype._invalidate = function () {
	delete this.id;
	delete this.jar;
	delete this.user;
	delete this.orgs;
};
