var async = require('async'),
	request = require('request'),
	urllib = require('url'),
	AppC = require('./index'),
	debug = require('debug')('appc:sdk');

function Cloud() {
}

function createCloudResponseHandler(callback) {
	return function(err,response,body) {
		debug('cloud response received, err=%o, body=%o',err,body);
		if (err) { return callback(err); }
		if (response.statusCode!==200) { return callback(body || 'Server error')};
		if (body) {
			try {
				body = JSON.parse(body);
			}
			catch (E) {
				return callback(E);
			}
			if (body.meta && body.meta.status==="ok") {
				return callback(null, body);
			}
		}
		return callback('Unknown error. '+body);
	}
}

/**
 * login to ACS backend using Platform session
 */
function login(session, callback) {

	var url = Cloud.getEnvironment(session) + '/v1/admins/login360.json?ct=enterprise&connect.sid='+session.id;

	request(AppC.createRequestObject(session,url), createCloudResponseHandler(function(err,body){
		if (!err) {
			session.acs_session = body.meta.session_id;
		}
		return callback(err);
	}));
}

/**
 * create a cloud ACS app (pre-built services)
 *
 */
Cloud._createApp = function createApp(session, name, callback) {
	var tasks = [];

	if (!session.acs_session) {
		tasks.push(function(next){
			login(session, next);
		});
	}

	tasks.push(function(next){
		var url = Cloud.getEnvironment(session) + '/v1/apps/create.json?_session_id='+session.acs_session+'&ct=enterprise';
		var r = request.post(AppC.createRequestObject(session,url), createCloudResponseHandler(function(err,body){
			if (err) { return next(err); }
			callback(null, body.response.apps[0]);
			next();
		}));
		var form = r.form();
		form.append('name',name);
	});

	async.series(tasks, function(err){
		if (err) { return callback(err); }
	});
};

function createACSResponseHandler(key, callback) {
	return AppC.createAPIResponseHandler(function(err,body) {
		if (err) { return callback(err); }
		if (body) {
			if (body.meta && body.meta.code === 200 && body.response) {
				var found = body.response[key];
				if (found) {
					// if we have a one entry array, just return the entry
					return callback(null, Array.isArray(found) && found.length===1 ? found[0] : found);
				}
			}
			if (key in body) {
				var found = body[key];
				// if we have a one entry array, just return the entry
				return callback(null, Array.isArray(found) && found.length===1 ? found[0] : found);
			}
			return callback(null, body);
		}
		return callback();
	});
}

/**
 * create a new cloud app for a given application
 *
 * @param {Object} session
 * @param {String} app_guid application guid
 * @param {Function} callback
 */
Cloud.createApp = function createApp (session, app_guid, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/acs'),
		obj = AppC.createRequestObject(session, url),
		req = request.post(obj, createACSResponseHandler('apps',callback)),
		form = req.form();

	form.append('app_guid', app_guid);
};

/**
 * create an ACS cloud user
 *
 * @param {Object} session
 * @param {String} app_guid application guid
 * @param {String} environment development, production, etc
 * @param {Object} keyvalues object of the properties to pass to create
 * @param {Function} callback
 */
Cloud.createUser = function createUser (session, app_guid, env, keyvalues, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/acs/'+app_guid+'/'+env+'/data.next/user'),
		obj = AppC.createRequestObject(session, url),
		req = request.post(obj, createACSResponseHandler('users',callback)),
		form = req.form();

	Object.keys(keyvalues).forEach(function(key){
		form.append(key, String(keyvalues[key]));
	});
};

Cloud.NODE_ACS = 'nodeACSEndpoint';
Cloud.ACS_BASE = 'acsBaseUrl';
Cloud.AUTH_BASE = 'acsAuthBaseUrl';

/**
 * return the appropriate environment url.
 *
 * @param {String} type is one of Cloud.NODE_ACS, Cloud.ACS_BASE or Cloud.AUTH_BASE
 * @param {String} name is one of production or development or another environment name
 */
Cloud.getEnvironment = function(session, type, name) {
	if (!session.user) {
		throw new Error("session is not valid. missing user");
	}
	if (!session.org) {
		throw new Error("session is not valid. missing org");
	}
	type = type || Cloud.ACS_BASE;
	name = name || AppC.isProduction ? 'production' : 'development';
	return session.org.envs.filter(function(env){
		return env.name===name;
	})[0][type];
};

module.exports = Cloud;
