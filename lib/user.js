/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2015 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for fetching user information
 */
var AppC = require('./index'),
	debug = require('debug')('appc:sdk'),
	cachedUser,
	cachedUserKey;

/**
 * User object
 */
function User() {
}

/**
 * find a specific user or if not userId is supplied, the sessions logged
 * in user
 *
 * @param  {Object}   session - session
 * @param  {Object}   orgId - orgId
 * @param  {Function} callback - callback
 */
User.find = function find(session, userId, callback) {
	var cache = userId && userId !== 'current';
	if (typeof(userId) === 'function') {
		callback = userId;
		if (session && session.user && session.user.guid) {
			userId = session.user.guid;
		} else {
			// don't cache if using current
			userId = 'current';
			cache = false;
		}
	}
	var key = cache && (session.id + userId);
	// if we already have it cached, just return it
	if (key && cachedUser && cachedUserKey === key) {
		debug('found cached user %s', key);
		return callback(null, cachedUser);
	}

	// jscs:disable jsDoc
	AppC.createRequest(session, '/api/v1/user/' + userId, function (err, user) {
		if (err) { return callback(err); }
		if (key) {
			cachedUserKey = key;
			cachedUser = user;
		}
		return callback(null, user);
	});
};

/**
 * switch the user's logged in user
 *
 * @param  {Object}   session - session
 * @param  {Object}   orgId - orgId
 * @param  {Function} callback - callback
 */
User.switchLoggedInOrg = function switchLoggedInOrg(session, orgId, callback) {
	AppC.Org.getById(session, orgId, function (err, org) {
		if (err) { return callback(err); }
		var req = AppC.createRequest(session, '/api/v1/auth/switchLoggedInOrg', 'post', callback, function mapper(obj, next) {
			session.user.org = org;
			// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
			session.user.org_id = orgId;
			next(null, obj);
		});
		if (req) {
			var form = req.form();
			form.append('org_id', orgId);
			debug('form parameters for %s, %o', req.url, form);
		}
	});

};

module.exports = User;
