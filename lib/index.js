'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const fs = require('fs');
const debug = require('debug')('Appc:sdk');

const version = require('../package.json').version;
const userAgent = require('./useragent');

// Init and export, setting module version and user-agent.
let Appc = exports = module.exports = { version, userAgent };

// Provide env accessor methods and set default env.
require('./env')(Appc);

// Provide request methods.
require('./request')(Appc);

// Load remaining modules and provide setters.
const modules = [
	'Analytics',
	'App',
	'Auth',
	'Cloud',
	'Feed',
	'Middleware',
	'Notification',
	'Org',
	'Registry',
	'User'
];
const props = modules.map(module => [ module, `./${module.toLowerCase()}` ]);
props.forEach(function (tuple) {
	Object.defineProperty(Appc, tuple[0], {
		configurable: true,
		enumerable: true,
		writable: false,
		get: function () {
			if (tuple.length > 2) {
				return tuple[2];
			}
			return (tuple[2] = require(tuple[1]));
		},
		set: function (v) {
			tuple[2] = v;
		}
	});
});
