/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2015 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for authentication
 */
var AppC = require('./index'),
	Auth = require('./auth'),
	request = require('request'),
	uuid = require('uuid-v4');

module.exports = Analytics;

/**
 * Analytics object
 */
function Analytics () {
}

/**
 * URL for sending data
 */
Analytics.url = 'https://api.appcelerator.net/p/v2/partner-track';

/**
 * send an analytics event to the Analytics API
 */
Analytics.sendEvent = function sendEvent (guid, mid, eventdata, event, deploytype, sid, callback) {
	if (!guid) {
		var error = new Error('missing required guid');
		if (callback) {
			return callback(error);
		} else {
			throw error;
		}
	}
	if (!mid) {
		// get the unique machine id
		return Auth.getUniqueMachineID(function (err, id) {
			Analytics.sendEvent(guid, id, eventdata, event, deploytype, sid, callback);
		});
	} else {
		sid = sid || uuid();
		deploytype = deploytype || 'production';
		event = event || 'appc.feature';
		eventdata = eventdata || {};
		var data = [
			{
				id: uuid(),
				sid: sid,
				aguid: guid,
				mid: mid,
				deploytype: deploytype,
				ts: new Date().toString(),
				event: event,
				data: eventdata,
				ver: '3'
			}
		];
		var opts = {
			url: Analytics.url,
			method: 'POST',
			json: data,
			timeout: 30000
		};
		request(opts, function (err, resp, body) {
			callback && callback(err, body);
		});
	}
};
