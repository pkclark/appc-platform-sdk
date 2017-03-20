'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const debug = require('debug')('Appc:sdk:analytics');
const request = require('request');
const uuid = require('uuid/v4');

const Appc = require('.');

/**
 * default location of the analytics cache
 */
const analyticsDir = path.join(os.homedir && os.homedir() || process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || '/tmp', '.appc-analytics');

/**
 * URL for sending data
 */
const url = Appc.analyticsurl;

/**
 * the interval in ms to send analytics. If set to 0, always send immediately.
 */
const flushInterval = 10000;

let Analytics = exports = module.exports = {
	analyticsDir,
	createSession,
	flushEvents,
	flushInterval,
	sendEvent,
	startSendingEvents,
	stopSendingEvents,
	storeEvent,
	url
};

let timer;
let sending;
let sequence = 1;

/**
 * store an event in the internal store ready to be sent
 * @private
 */
function storeEvent(obj) {
	!fs.existsSync(analyticsDir) && fs.mkdirSync(analyticsDir);
	let fn = path.join(analyticsDir, Math.floor(Date.now()) + '-' + obj.seq + '-' + obj.id + '.json');
	debug('store event', obj, fn);
	fs.writeFileSync(fn, JSON.stringify(obj));
}

/**
 * flush pending events to analytics
 * @private
 */
function flushEvents(callback) {
	debug('flushEvents', fs.existsSync(analyticsDir), 'sending', sending);
	if (fs.existsSync(analyticsDir) && !sending) {
		let files = fs.readdirSync(analyticsDir);
		if (files.length) {
			sending = true;
			// sort them in timestamp order
			files.sort();
			let data = files.map(function (fn) {
				let buf = fs.readFileSync(path.join(analyticsDir, fn));
				return JSON.parse(buf);
			});
			let opts = {
				url: url,
				method: 'POST',
				json: data,
				timeout: 30000
			};
			debug('flushEvents sending', opts);
			return request(opts, function (err, resp, body) {
				sending = false;
				debug('flushEvents response', err, resp && resp.statusCode, body);
				// if the server accepted the events, delete them
				if (!err && body && body.length) {
					body.forEach(function (status, i) {
						// delete the files the server accepted
						if (status === 204) {
							let fn = path.join(analyticsDir, files[i]);
							fs.existsSync(fn) && fs.unlinkSync(fn);
						}
					});
					// pause the event timer if we have no pending events, will
					// restart automatically when a new event is queued
					if (timer && fs.readdirSync(analyticsDir).length === 0) {
						stopSendingEvents();
					}
				}
				callback && callback(err, data, true);
			});
		}
	}
	callback && callback();
}

/**
 * called to start sending events
 * @private
 */
function startSendingEvents() {
	debug('startSendingEvents', flushInterval);
	if (!timer && flushInterval) {
		timer = setInterval(flushEvents, flushInterval);
		// don't allow the process to hold because of the timer if we are ready to exit
		timer.unref();
	}
}

/**
 * called to stop sending events
 * @private
 */
function stopSendingEvents() {
	debug('stopSendingEvents');
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
}

/**
 * Session class
 * @private
 */
function Session(guid, mid, sid, deploytype, platform) {
	this.guid = guid;
	this.mid = mid;
	this.sid = sid;
	this.deploytype = deploytype;
	this.platform = platform;
}

/**
 * send a session event
 */
Session.prototype.send = function (eventdata, event) {
	sendEvent(this.guid, this.mid, eventdata, event, this.deploytype, this.sid, this.platform);
};

/**
 * send an end session event
 */
Session.prototype.end = function (data) {
	sendEvent(this.guid, this.mid, data, 'ti.end', this.deploytype, this.sid, this.platform);
};

/**
 * create an analytics Session and send the session start event (ti.start) and then return a session object
 * which `end` should be called when the session is completed.
 */
function createSession(guid, mid, eventdata, deploytype, platform) {
	var sid = uuid();
	sendEvent(guid, mid, eventdata, 'ti.start', deploytype, sid, platform);
	return new Session(guid, mid, sid, deploytype, platform);
}

/**
 * send an analytics event to the Analytics API
 */
function sendEvent(aguid, props, callback, immediate) {
	if (!aguid) {
		const err = new Error('missing required guid');
		if (callback) {
			return callback(err);
		}
		throw err;
	}

	// Cast props if not passed as object.
	if (!props || typeof props !== 'object') {
		props = {};
	}

	if (!props.mid) {
		// get the unique machine id
		return Appc.Auth.getUniqueMachineID(function (err, machineId) {
			if (err) {
				if (callback) {
					return callback(err);
				}
				throw err;
			}
			sendEvent(aguid, Object.assign(props, { mid: machineId }), callback, immediate);
		});
	}

	let event = {
		id: uuid(),
		ver: '3',
		aguid,
		event: props.event || 'app.feature',
		sid: props.sid || uuid(),
		mid: props.mid,
		platform: props.platform || Appc.userAgent,
		deploytype: props.deploytype || 'production',
		ts: new Date().toISOString(),
		data: props.data || {},
		seq: sequence++
	};

	storeEvent(event);

	// immediately send the event if we are immediate or if we have a callback
	if (immediate || callback) {
		return flushEvents(callback);
	}

	// start sending events (if not already running)
	startSendingEvents();
	callback && callback(null, event, false);
}

// on shutdown, try and send any events if possible
process.once('exit', flushEvents);
