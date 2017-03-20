'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for fetching org information
 */

const Appc = require('.');

module.exports = {
	find,
	findById,
	getById,
	getByName,
	getCurrent
};

let cachedOrgKey;
let cachedOrg;

/**
 * Find the orgs that the logged in user belongs to
 *
 * @param  {Object}   session - session
 * @param  {Function} callback - callback
 * @return {Function} - callback function
 */
function find(session, callback) {
	if (!session || !session.id) {
		return callback(new Error('session is not valid'));
	}

	if (cachedOrg && cachedOrgKey === session.id) {
		return callback(null, cachedOrg);
	}

	Appc.createRequest(session, '/api/v1/user/organizations', function (err, org, resp) {
		if (err) {
			return callback(err, null, resp);
		}

		cachedOrg = org;
		cachedOrgKey = session.id;
		return callback(null, org, resp);
	});
};

/**
 * Return an organization by checking the session
 *
 * @param  {Object}   session - session
 * @param  {number}   id - id
 * @param  {Function} callback - callback
 * @return {Function} - callback function
 */
function getById(session, id, callback) {
	if (!session || !session.id) {
		return callback(new Error('session is not valid'));
	}

	let org = session.orgs && session.orgs[id];
	if (org) {
		return callback(null, org);
	}

	return callback(new Error('id is not valid'));
};

/**
 * Find organization for a given org id
 *
 * @param  {Object}   session - session
 * @param  {number}   id - id
 * @param  {Function} callback - callback
 */
function findById(session, id, callback) {
	if (!id) {
		return callback(new Error('id is not valid'));
	}

	Appc.createRequest(session, '/api/v1/org/' + id, callback);
};

/**
 * Get an organization by name
 *
 * @param  {Object}   session - session
 * @param  {string}   name - name
 * @param  {Function} callback - callback
 * @return {Function} - callback function
 */
function getByName(session, name, callback) {
	if (!session || !session.id) {
		return callback(new Error('session is not valid'));
	}

	let org = Object.keys(session.orgs || {}).find(id => session.orgs[id].name === name);
	if (org) {
		return callback(null, session.orgs[org]);
	}

	return callback(new Error('Org not found'));
};

/**
 * Return the current logged in organization
 *
 * @param  {Object}   session - session
 * @return {Function} - callback function
 */
function getCurrent(session, callback) {
	if (session && session.user && session.user.org) {
		return callback(null, session.user.org);
	}

	return callback(new Error('session is not valid'));
};
