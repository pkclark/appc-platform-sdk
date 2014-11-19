/**
 * make a request to AppC platform for fetching app information
 */
var request = require('request'),
	urllib = require('url'),
	fs = require('fs'),
	AppC = require('./index');

function App() {
}


/**
 * find the apps that the logged in has access to
 *
 * @param {Object} session
 * @param {String} org id
 * @param {Function} callback
 */
App.findAll = function(session, org_id, callback) {
	if (org_id && typeof(org_id)=='function') {
		callback = org_id;
		org_id = null;
	}
	var url = urllib.resolve(AppC.baseurl, '/api/v1/app' + (org_id?('?org_id'+org_id):''));
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
}

/**
 * find a specific app by id
 *
 * @param {Object} session
 * @param {String} app id
 * @param {Function} callback
 */
App.find = function(session, app_id, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/app/'+app_id);
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
}

/**
 * update an app
 *
 * @param {Object} session
 * @param {Object} app object to update
 * @param {Function} callback
 */
App.update = function(session, app, callback) {
	var guid = app.app_guid;
	if (!guid) throw new Error("no app_guid property found");
	var url = urllib.resolve(AppC.baseurl, '/api/v1/app/'+guid),
		obj = AppC.createRequestObject(session,url);
	obj.json = app;
	request.put(obj,AppC.createAPIResponseHandler(callback));
}

/**
 * create or update an application from tiapp.xml file
 *
 * @param {Object} session
 * @param {String} file location (path) to tiapp.xml
 * @param {String} org_id if not supplied, use the current logged in org
 * @param {Function} callback
 */
App.create = function(session, tiappxml, org_id, callback) {
	if (typeof(org_id)==='object' || org_id===null) {
		callback = org_id;
		// use the current session
		org_id = session.user.org_id;
	}
	if (!fs.existsSync(tiappxml)) {
		return callback(new Error("tiapp.xml file doesn't not exist"));
	}
	var url = urllib.resolve(AppC.baseurl, '/api/v1/app/saveFromTiApp?org_id='+org_id);
	fs.readFile(tiappxml, function(err, data) {
		if (err) { return callback(err); }

		var obj = AppC.createRequestObject(session,url),
			req = request.post(obj, AppC.createAPIResponseHandler(callback)),
			form = req.form();

		form.append('tiapp',data, {filename:'tiapp.xml'});
	});
}

module.exports = App;
