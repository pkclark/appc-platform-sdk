'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

/**
 * make a request to AppC platform for fetching notifications
 */
const Appc = require('.');

let Notification = exports = module.exports = {};

/**
 * find all the notifications for the logged in user
 */
Notification.findAll = function findAll(session, callback) {
	Appc.createRequest(session, '/api/v1/notification', callback);
};
