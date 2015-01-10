/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2015 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for fetching org information
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index'),
	cachedOrgKey,
	cachedOrg;

function Org() {
}


/**
 * find the orgs that the logged in user belongs to
 */
Org.find = function find(session, callback) {
	if (cachedOrg && cachedOrgKey===session.id) {
		return callback(null, cachedOrg);
	}
	var url = urllib.resolve(AppC.baseurl, '/api/v1/user/organizations'),
		next = function(err,org) {
			if (err) { return callback(err); }
			cachedOrg = org;
			cachedOrgKey = session.id;
			callback(null,org);
		};
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(next));
};

/**
 * return an organization by 
 */
Org.getById = function getById(session, id) {
	return session && session.orgs && session.orgs[id];
};

/**
 * find organization for a given org id
 */
Org.findById = function findById(session, id, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/org/'+id);
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
};

/**
 * get an organization by name
 */
Org.getByName = function getByName(session, name) {
	var keys = Object.keys(session.orgs || {}),
		length = keys.length;
	for (var c=0;c<length;c++) {
		var org_id = keys[c],
			org = session.orgs[org_id];
		if (org.name===name) {
			return org;
		}
	}
};

/**
 * return the current logged in organization
 */
Org.getCurrent = function getCurrent(session) {
	return session.user.org;
};


module.exports = Org;
