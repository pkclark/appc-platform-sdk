/**
 * make a request to AppC platform for authentication
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index'),
	Session = require('./session');

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

/**
 * login
 */
Auth.login = function(username, password, callback) {
	var session = new Session(),
		url = urllib.resolve(AppC.baseurl, '/api/v1/auth/login'),
		next = AppC.createAPIResponseHandler(callback, function mapper(obj, next) {
			session._set(obj);
			// find our orgs
			AppC.Org.find(session,function(err,orgs){
				if (err) return callback(err);
				session.orgs = {};
				// map in our orgs
				orgs && orgs.forEach(function(org){
					session.orgs[org.org_id] = org;
				});
				// set our org to the logged in org
				session.user.org_id && (session.user.org = session.orgs[session.user.org_id]);
				next(null,session);
			});
		}),
		r = request.post(AppC.createRequestObject(session,url), next),
		form = r.form();

	form.append('username',username);
	form.append('password',password);
	form.append('from',AppC.userAgent);

}

module.exports = Auth;
