'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for fetching app information
 */

const fs = require('fs');

const debug = require('debug')('Appc:sdk:app');

const Appc = require('.');

let App = exports = module.exports = {
	create,
	crittercismID,
	delete: deleteApp,
	find,
	findAll,
	findPackage,
	findTeamMembers,
	save,
	update,
	updateTiApp: save
};

/**
 * find the apps that the logged in has access to
 *
 * @param {Object} session
 * @param {string} org id
 * @param {Function} callback
 */
function findAll(session, orgId, callback) {
	if (orgId && typeof orgId === 'function') {
		callback = orgId;
		orgId = null;
	}
	Appc.createRequest(session, '/api/v1/app' + (orgId ? ('?org_id=' + orgId) : ''), callback);
}

/**
 * find a specific app by id
 *
 * @param {Object} session
 * @param {string} app id
 * @param {Function} callback
 */
function find(session, appId, callback) {
	Appc.createRequest(session, '/api/v1/app/' + appId, callback);
}

/**
 * update an app
 *
 * @param {Object} session
 * @param {Object} app object to update
 * @param {Function} callback
 */
function update(session, app, callback) {
	var guid = app.app_guid;
	if (!guid) {
		return callback(new Error('no app_guid property found'));
	}
	Appc.createRequest(session, '/api/v1/app/' + guid, 'put', callback, app);
}

/**
 * Create or update an app from tiapp.xml file.
 *
 * @param {Object} session
 * @param {String} tiAppPath file path of tiapp.xml
 * @param {String} orgId org_id to register app to; if not supplied, uses logged-in org
 * @param {Object} opts optional params to pass as query string with app save request
 * @param {Function} callback
 */
function create(session, tiAppPath, orgId, opts, callback) {
	if (typeof orgId === 'function') {
		callback = orgId;
		orgId = null;
		opts = {};
	}

	if (typeof opts === 'function') {
		callback = opts;
		opts = {};
	}

	if (orgId === null) {
		// use the current session
		if (session && session.user && session.user.org_id) {
			orgId = session.user.org_id;
		} else {
			return callback(new Error('session is not valid'));
		}
	}

	fs.readFile(tiAppPath, function (err, tiappxml) {
		if (err) {
			if (err.code === 'ENOENT') {
				return callback(new Error('tiapp.xml file does not exist'));
			}
			return callback(err);
		}
		App.save(session, orgId, tiappxml, opts, callback);
	});
}

/**
 * Create or update an app from tiapp.xml file.
 *
 * @param {Object} session
 * @param {String} orgId if not supplied, use the current logged in org
 * @param {String} tiappxml contents of tiapp.xml file
 * @param {Object} opts optional params to pass as query string with app save request
 * @param {Function} callback
 */
function save(session, orgId, tiappxml, opts, callback) {
	if (typeof opts === 'function') {
		callback = opts;
		opts = {};
	}

	// Form query string with opts.
	opts.org_id = orgId;
	let qs = Object.keys(opts).reduce(function (val, key) {
		return `${val}&${key}=${opts[key]}`;
	}, '');

	let path = `/api/v1/app/saveFromTiApp?${qs}`;

	let req = Appc.createRequest(session, path, 'post', callback);
	if (req) {
		let form = req.form();
		form.append('tiapp', tiappxml, { filename: 'tiapp.xml' });
		debug('form parameters for %s, %o', req.uri.href, form);
	}
}

/**
 * find an application package by application guid; can be called with token or session
 *
 * @param {Object} session
 * @param {String} guid app_guid
 * @param {String} token session token
 * @param {Function} callback
 */
function findPackage(session, guid, token, callback) {
	if (typeof session === 'string') {
		callback = token;
		token = guid;
		guid = session;
		session = null;
	} else if (typeof token === 'function') {
		callback = token;
	}
	Appc.createRequest(session || token, '/api/v1/app/' + guid + '/package', callback);
}

/**
 * for a given application guid, find the configuration application teams
 */
function findTeamMembers(session, guid, callback) {
	Appc.createRequest(session, '/api/v1/app/' + guid + '/team', callback);
}

/**
 * delete a specific app by id
 * @param {Object} session
 * @param {String} app id
 * @param {Function} callback
 */
function deleteApp(session, appId, callback) {
	Appc.createRequest(session, '/api/v1/app/' + appId, 'del', callback);
}

/**
 * Fetch Apteligent ID for app.
 * @param {Object} session
 * @param {String} guid app guid
 * @param {Function} callback
 */
function crittercismID(session, guid, callback) {
	Appc.createRequest(session, '/api/v1/app/' + guid + '/crittercism_id', callback);
}
