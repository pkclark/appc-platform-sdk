/**
 * make a request to AppC platform for authentication
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index'),
	User = require('./user'),
	Session = require('./session'),
	tough = require('tough-cookie');

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
		// set our org to the logged in org
		session.user.org_id && (session.user.org = session.orgs[session.user.org_id]);
		next(null,session);
	});
}

/**
 * login
 */
Auth.login = function(username, password, callback) {
	var session = new Session(),
		url = urllib.resolve(AppC.baseurl, '/api/v1/auth/login'),
		next = AppC.createAPIResponseHandler(callback, function mapper(obj, next) {
			session._set(obj);
			resolveUserOrg(session,next);
		}),
		r = request.post(AppC.createRequestObject(session,url), next),
		form = r.form();

	form.append('username',username);
	form.append('password',password);
	form.append('from',AppC.userAgent);

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
	session.jar = new tough.CookieJar();

	session.jar.setCookie(cookie, AppC.baseurl, function(err, cookie){
		if (err) { return callback(err); }
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
