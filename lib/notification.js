/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2015 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for fetching notifications
 */
var request = require('request-ssl'),
	urllib = require('url'),
	AppC = require('./index');

function Notification() {
}

/**
 * find all the notifications for the logged in user
 */
Notification.findAll = function findAll(session, callback) {
	var url = urllib.resolve(AppC.baseurl, '/api/v1/notification');
	request.get(AppC.createRequestObject(session,url), AppC.createAPIResponseHandler(callback));
};

module.exports = Notification;
