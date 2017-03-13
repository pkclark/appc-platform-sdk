'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const debug = require('debug')('appc:sdk');
const tc = require('tough-cookie');

const Auth = require('./auth');
const Org = require('./org');
const Request = require('./request');

module.exports = {
	find,
	switchLoggedInOrg
};

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

	Request.createRequest(session, '/api/v1/user/' + userId, function (err, user) {
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

/**
 * switch the user's logged in user
 *
 * @param  {Object}   session - session
 * @param  {Object}   orgId - orgId
 * @param  {Function} callback - callback
 */
function switchLoggedInOrg(session, orgId, callback) {
	Org.getById(session, orgId, function (err, org) {
		if (err) {
			return callback(err);
		}

		let req = Request.createRequest(session, '/api/v1/auth/switchLoggedInOrg', 'post', callback, function mapper(obj, next, resp) {
			let cookies;

			// switch will invalidate previous session so we need to get the new session id
			if (resp.headers['set-cookie'] instanceof Array) {
				cookies = resp.headers['set-cookie'].map(function (c) {
					return (tc.parse(c));
				});
			} else {
				cookies = [ tc.parse(resp.headers['set-cookie']) ];
			}

			let sid;
			if (cookies) {
				for (let c = 0; c < cookies.length; c++) {
					let cookie = cookies[c];
					if (cookie.key === 'connect.sid') {
						session.id = sid = decodeURIComponent(cookie.value);
						break;
					}
				}
			}
			cachedUser = null;
			cachedUserKey = null;
			Auth.createSessionFromID(sid, function (err, newsession) {
				if (err) {
					return next(err);
				}

				if (newsession) {
					Auth.cacheSession(newsession);
				}

				next(null, obj, newsession);
			});
		});

		if (req) {
			let form = req.form();
			form.append('org_id', orgId);
			debug('form parameters for %s, %o', req.url, form);
		}
	});
};
