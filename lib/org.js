/**
 * make a request to AppC platform for fetching org information
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index');

function Org() {
}


/**
 * find the orgs that the logged in user belongs to
 */
Org.find = function(session, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/user/organizations');
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
}

/**
 * return an organization by 
 */
Org.getById = function(session, id) {
	return session.orgs && session.orgs[id];
}

/**
 * find organization for a given org id
 */
Org.findById = function(session, id, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/org/'+id);
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
}

/**
 * get an organization by name
 */
Org.getByName = function(session, name) {
	var keys = Object.keys(session.orgs || {}),
		length = keys.length;
	for (var c=0;c<length;c++) {
		var org_id = keys[c],
			org = session.orgs[org_id];
		if (org.name===name) {
			return org;
		}
	}
}

/**
 * return the current logged in organization
 */
Org.getCurrent = function(session) {
	return session.user.org;
}


module.exports = Org;
