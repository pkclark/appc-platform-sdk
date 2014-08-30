/**
 * make a request to AppC platform for fetching app information
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index');

function App() {
}


/**
 * find the apps that the logged in has access to
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
 */
App.find = function(session, app_id, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/app/'+app_id);
	request.get(AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
}

App.update = function(session, app, callback) {
	var guid = app.app_guid;
	if (!guid) throw new Error("no app_guid property found");
	var url = urllib.resolve(AppC.baseurl, '/api/v1/app/'+guid),
		obj = AppC.createRequestObject(session,url);
	obj.json = app;
	request.put(obj,AppC.createAPIResponseHandler(callback)); 
}

module.exports = App;
