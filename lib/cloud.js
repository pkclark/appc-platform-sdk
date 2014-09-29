var async = require('async'),
	request = require('request'),
	AppC = require('./index');

Cloud.baseurl = 'https://api.cloud.appcelerator.com';

function Cloud() {
}


function createCloudResponseHandler(callback) {
	return function(err,response,body) {
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

	var url = Cloud.baseurl + "/v1/admins/login360.json?ct=enterprise&connect.sid="+session.id;

	request(AppC.createRequestObject(session,url), createCloudResponseHandler(function(err,body){
		if (!err) {
			session.acs_session = body.meta.session_id;
		}
		return callback(err);
	}));
}

/**
 * create a cloud ACS app (pre-built services)
 */
Cloud.createApp = function createApp(session, name, callback) {
	var tasks = [];

	if (!session.acs_session) {
		tasks.push(function(next){
			login(session, next);
		});
	}

	tasks.push(function(next){
		var url = Cloud.baseurl + '/v1/apps/create.json?_session_id='+session.acs_session+'&ct=enterprise';
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

module.exports = Cloud;
