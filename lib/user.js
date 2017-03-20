'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const debug = require('debug')('Appc:sdk:user');
const tc = require('tough-cookie');

const Appc = require('.');

module.exports = { find };

let cachedUser;
let cachedUserKey;

/**
 * find a specific user or, if not userId is supplied, the session's logged-in user
 *
 * @param  {Object}   session - session
 * @param  {Object}   orgId - orgId
 * @param  {Function} callback - callback
 */
function find(session, userId, callback) {
	let cache = userId && userId !== 'current';

	if (typeof userId === 'function') {
		callback = userId;
		if (session && session.user && session.user.guid) {
			userId = session.user.guid;
		} else {
			// don't cache if using current
			userId = 'current';
			cache = false;
		}
	}

	let key = cache && (session.id + userId);

	// if we already have it cached, just return it
	if (key && cachedUser && cachedUserKey === key) {
		debug('found cached user %s', key);
		return callback(null, cachedUser);
	}

	Appc.createRequest(session, '/api/v1/user/' + userId, function (err, user) {
		if (err) {
			return callback(err);
		}

		if (key) {
			cachedUserKey = key;
			cachedUser = user;
		}

		return callback(null, user);
	});
};
