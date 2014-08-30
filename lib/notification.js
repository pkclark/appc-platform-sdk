/**
 * make a request to AppC platform for fetching notifications
 */
var request = require('request'),
	urllib = require('url'),
	AppC = require('./index');

function Notification() {
}

/**
 * find all the notifications for the logged in user
 */
Notification.findAll = function(session, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/notification');
	request.get(AppC.createRequestObject(session,url), AppC.createAPIResponseHandler(callback));
}

module.exports = Notification;
