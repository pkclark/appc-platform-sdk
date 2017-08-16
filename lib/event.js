'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform to send an event
 */

const Appc = require('.');

const debug = require('debug')('appc:sdk:event');

module.exports = {
	send
};

/**
 * Sends an event to platform
 *
 * @param  {Object}   session - session
 * @param  {String}   name - event name
 * @param  {Object}   data - event data (optional)
 * @param  {Function} callback - callback (optional)
 * @return {Function} - callback function
 */
function send(session, name, data, callback) {
	if (data && typeof data === 'function') {
		callback = data;
		data = {};
	}

	if (!data) {
		data = {};
	}

	if (!session || !session.id) {
		debug('invalid session');
		return callback ? callback(new Error('invalid session')) : new Error('invalid session');
	}

	if (!name || typeof name !== 'string') {
		debug('invalid event name');
		return callback ? callback(new Error('invalid event name')) : new Error('invalid event name');
	}

	if (typeof data !== 'object') {
		debug('invalid event data');
		return callback ? callback(new Error('invalid event data')) : new Error('invalid event data');
	}

	let req = Appc.createRequest(session, '/api/v1/event', 'post', function (err, body, resp) {
		if (err) {
			debug('event send error %o', err);
			return callback && callback(err, null, resp);
		}

		callback && callback(null, body, resp);
	});

	if (req) {
		let form = req.form();
		form.append('name', name);
		form.append('data', JSON.stringify(data));
		debug('form parameters for %s, %o', req.uri.href, form);
	}

	return req;
}
