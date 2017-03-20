'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const async = require('async');
const debug = require('debug')('Appc:sdk:cloud');

const Appc = require('.');

const ACS_BASE = 'acsBaseUrl';
const AUTH_BASE = 'acsAuthBaseUrl';
const NODE_ACS = 'nodeACSEndpoint';

let Cloud = exports = module.exports = {
	ACS_BASE,
	AUTH_BASE,
	NODE_ACS,
	createApp,
	createNamedApp,
	createUser,
	getEnvironment,
	retrieveUsers
};

/**
 * createACSResponseHandler
 */
function createACSResponseHandler(key, callback) {
	return function (err, body) {
		if (err) {
			return callback(err);
		}
		if (body) {
			let found;
			if (body.meta && body.meta.code === 200 && body.response) {
				found = body.response[key];
				if (found) {
					// if we have a one entry array, just return the entry
					return callback(null, Array.isArray(found) && found.length === 1 ? found[0] : found);
				}
			}
			if (key in body) {
				found = body[key];
				// if we have a one entry array, just return the entry
				return callback(null, Array.isArray(found) && found.length === 1 ? found[0] : found);
			}
			return callback(null, body);
		}
		return callback();
	};
}

/**
 * Create cloud response handler
 */
function createCloudResponseHandler(callback) {
	return function (err, response, body) {
		debug('cloud response received, err=%o, body=%o', err, body);
		if (err) {
			return callback(err);
		}
		if (response && response.statusCode !== 200) {
			try {
				body = JSON.parse(body);
			}
			catch(e) {}
			return callback(body.meta && body.meta.message || 'Server error');
		}
		if (body) {
			try {
				body = JSON.parse(body);
			}
			catch(e) {
				return callback(e);
			}
			if (body.meta && body.meta.status === 'ok') {
				return callback(null, body);
			}
		}
		return callback(new Error('Unknown error. ' + body));
	};
}

/**
 * login to ACS backend using Platform session
 */
function login(session, callback) {
	try {
		let url = getEnvironment(session) + '/v1/admins/login360.json?ct=enterprise&connect.sid=' + session.id;
		debug('acs login %s', url);
		Appc.createRequestCustomResponseHandler(session, url, createCloudResponseHandler(function (err, body) {
			if (!err && body) {
				session.acs_session = body.meta.session_id;
			}
			return callback(err, body);
		}));
	} catch(e) {
		return callback(e);
	}
}

/**
 * Create a named cloud ACS app (pre-built services)
 *
 * @param {Object} session
 * @param {string} name application name
 * @param {Function} callback
 */
function createNamedApp(session, name, callback) {
	try {
		let tasks = [],
			apps;

		// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		if (!session.acs_session) {
			tasks.push(function (next) {
				login(session, next);
			});
		}

		tasks.push(function (next) {
			var url = getEnvironment(session) + '/v1/apps/create.json?_session_id=' + session.acs_session + '&ct=enterprise';
			var r = Appc.createRequestCustomResponseHandler(session, url, 'post', createCloudResponseHandler(function (err, body) {
				if (err) {
					return next(err);
				}
				apps = body.response.apps;
				if (!apps || apps.length === 0) {
					return next(new Error('couldn\'t create cloud application. please try again.'));
				}
				next();
			}));
			if (r) {
				let form = r.form();
				form.append('name', name);
				debug('form parameters for %s, %o', r.url, form);
			}
		});

		tasks.push(function (next) {
			async.each(apps, function (app, cb) {
				var req = Appc.createRequestCustomResponseHandler(session, '/api/v1/api', 'post', createACSResponseHandler('apps', function (err, result) {
					if (err) {
						return next(err);
					}
					if (result.length === 0) {
						return next(new Error('no applications created. please try your request again.'));
					}
					app.dashboard = result;
					cb();
				}));
				if (req) {
					let form = req.form();
					form.append('name', name);
					form.append('id', app.id);
					form.append('type', 'data');
					// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
					form.append('org_id', session.user.org_id);
					debug('form parameters for %s, %o', req.url, form);
				}
			}, function (err) {
				if (err) {
					return next(err);
				}
				callback(null, apps);
			});
		});

		async.series(tasks, function (err) {
			if (err) {
				return callback(err);
			}
		});
	} catch(e) {
		return callback(e);
	}
};

/**
 * create a new cloud app for a given application (returns an array of apps, one for each environment)
 * appName, orgId or appGuid are optional (use null rather than omitting the value)
 *
 * @param {Object} session
 * @param {string} name of the app Appclerator by default
 * @param {string} orgId id of the org to create in
 * @param {string} appGuid application guid
 * @param {Function} callback
 */
function createApp(session, appName, orgId, appGuid, callback) {
	let uri = '/api/v1/acs';
	if (orgId) {
		uri += '?org_id=' + orgId;
	}

	var req = Appc.createRequest(session, uri, 'post', createACSResponseHandler('apps', callback));
	if (req) {
		var form = req.form();
		if (appGuid) {
			form.append('app_guid', appGuid);
		}
		if (appName) {
			form.append('app_name', appName);
		}
		debug('form parameters for %s, %o', req.url, form);
	}
};

/**
 * create an ACS cloud user
 *
 * @param {Object} session
 * @param {string} guid api guid
 * @param {Object} keyvalues object of the properties to pass to create
 * @param {Function} callback
 */
function createUser(session, guid, keyvalues, callback) {
	let req = Appc.createRequest(session, '/api/v1/acs/' + guid + '/data.next/user', 'post', createACSResponseHandler('users', callback));
	if (req) {
		let form = req.form();
		Object.keys(keyvalues).forEach(function (key) {
			form.append(key, String(keyvalues[key]));
		});
		debug('form parameters for %s, %o', req.url, form);
	}
};

/**
 * return the appropriate environment url.
 *
 * @param {string} type is one of NODE_ACS, ACS_BASE or AUTH_BASE
 * @param {string} name is one of production or development or another environment name
 */
function getEnvironment(session, type, name) {
	if (!session.user) {
		throw new Error('session is not valid. missing user');
	}
	if (!session.org && !session.user.org) {
		throw new Error('session is not valid. missing org');
	}
	// TODO: session.org = session.org || session.user.org;
	type = type || ACS_BASE;
	name = name || Appc.isProduction ? 'production' : 'development';
	return session.user.org.envs.find(function (env) {
		return env.name === name;
	})[type];
};

/**
 * retrieve the list of ACS users for the app guid
 *
 * @param {Object} session
 * @param {string} guid api guid
 * @param {Function} callback
 */
function retrieveUsers(session, guid, callback) {
	Appc.createRequest(session, '/api/v1/acs/' + guid + '/data.next/user', createACSResponseHandler('users', callback));
};
