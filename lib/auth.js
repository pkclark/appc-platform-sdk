/**
 * make a request to AppC platform for authentication
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index'),
	User = require('./user'),
	Session = require('./session'),
	tough = require('tough-cookie'),
	Mac = require('getmac');

function Auth() {
}


/**
 * logout. once this method completes the session will no longer be valid
 */
Auth.logout = function(session, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/auth/logout'),
		next = function() {
			session._invalidate();
			callback && callback();
		};
	request.post(AppC.createRequestObject(session,url), next);
}

function resolveUserOrg(session, next) {
	// find our orgs
	AppC.Org.find(session,function(err,orgs){
		if (err) return next(err);
		session.orgs = {};
		// map in our orgs
		orgs && orgs.forEach(function(org){
			session.orgs[org.org_id] = org;
		});
		if (session.user.org_id) {
			// set our org to the logged in org
			session.user.org_id && (session.user.org = session.orgs[session.user.org_id]);
		}
		else if (session.user.last_logged_in_org) {
			// get the last logged in org to set it
			session.user.org_id = session.user.last_logged_in_org;
			session.user.org = session.orgs[session.user.org_id];
		}
		else if (session.user.last_accessed_orgs) {
			// get the last accessed org in this case
			session.user.org_id = session.user.last_accessed_orgs[session.user.last_accessed_orgs.length-1].org_id;
			session.user.org = session.orgs[session.user.org_id];
		}
		else if (session.user.default_org) {
			// try and set the default org
			session.user.org_id = orgs.filter(function(org){return org.guid===default_org;})[0].org_id;
			session.user.org = session.orgs[session.user.org_id];
		}
		next(null,session);
	});
}

/**
 * login
 */
Auth.login = function(username, password, callback) {
	Mac.getMac(function(err,macAddress) {
		var session = new Session(),
			url = urllib.resolve(AppC.baseurl, '/api/v1/auth/login'),
			checkError = function(err, result) {
				if (err) {
					if (err.code) {
						switch(err.code) {
							case 'ECONNREFUSED': {
								return callback(new Error("Connection refused to "+AppC.baseurl));
							}
							case 'ECONNRESET': {
								return callback(new Error("Connection reset to "+AppC.baseurl));
							}
							case 'CERT_HAS_EXPIRED': {
								return callback(new Error("The servers SSL certificate at "+AppC.baseurl+" has expired. Refusing to connect."));
							}
							case 400: {
								return callback(err);
							}
						}
					}
					return callback(err);
				}
				callback(null,result);
			},
			next = AppC.createAPIResponseHandler(checkError, function mapper(obj, next) {
				session._set(obj);
				resolveUserOrg(session,next);
			}),
			r = request.post(AppC.createRequestObject(session,url), next),
			form = r.form();

		form.append('username',username);
		form.append('password',password);
		form.append('keepMeSignedIn','true');
		form.append('from',AppC.userAgent);
		form.append('deviceid',macAddress||'00-00-00-00-00-00');
		process.env.DEBUG && console.log('device id is',macAddress);
	});
}

/**
 * from an existing authenticated session, create a new Session object
 */
Auth.createSessionFromID = function createSessionFromID(id, callback) {
	var session = new Session(),
		url = require('url'),
		parse = url.parse(AppC.baseurl),
		host = parse.host,
		path = parse.path,
		cookie = new tough.Cookie();

	cookie.key = 'connect.sid';
	cookie.value = id;
	cookie.secure = true;
	cookie.httpOnly = true;
	cookie.path = path;
	cookie.domain = host;
	cookie.expires = Infinity;
	cookie.hostOnly = false
	cookie.creation = new Date;
	cookie.lastAccessed = new Date;

	session.id = id;
	session.jar = request.jar();

	session.jar.setCookie(cookie.toString(), AppC.baseurl, function(err, cookie){
		if (err) { return callback(err); }
		if (!cookie) { return callback(new Error("session cookie not set")); }
		// fetch the current user and set it on the session
		User.find(session,function(err,user){
			if (err) { return callback(err); }
			session.user = user;
			resolveUserOrg(session,function(err){
				callback(err,session);
			});
		});
	});
};

module.exports = Auth;
