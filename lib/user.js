/**
 * make a request to AppC platform for fetching user information
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index');

function User() {
}

/**
 * find a specific user or if not user_id is supplied, the sessions logged
 * in user
 */
User.find = function(session, user_id, callback) {
	if (typeof(user_id)==='function') {
		callback = user_id;
		user_id = session && session.user && session.user.guid;
	}
	var url = urllib.resolve(AppC.baseurl, '/api/v1/user/'+user_id);
	request.get(AppC.createRequestObject(session,url), AppC.createAPIResponseHandler(callback));
}

/**
 * switch the users logged in user
 */
User.switchLoggedInOrg = function(session, org_id, callback) {
	var org = AppC.Org.getById(session, org_id);
	if (!org) return callback("Cannot find org_id: "+org_id);
	var url = urllib.resolve(AppC.baseurl, '/api/v1/auth/switchLoggedInOrg'),
		next = AppC.createAPIResponseHandler(callback, function mapper(obj, next) {
			session.user.org = org;
			session.user.org_id = org_id;
			console.log('switched org',org);
			next(null,obj);
		}),
		r = request.post(AppC.createRequestObject(session,url), next),
		form = r.form();

	form.append('org_id',org_id);
}

module.exports = User;
