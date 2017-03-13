'use strict';

/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2017 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */

const os = require('os');

// Set version from package.json.
const version = require('../package.json').version;

// Set language if process provides it.
const lang = process.env.LANG ? ('; ' + process.env.LANG.split('.')[0]) : '';

// Set platform string.
let platform;

switch (process.platform) {
	case 'darwin': {
		platform = 'Macintosh; Intel Mac OS X ' + os.release().replace(/\./g, '_');
		break;
	}
	case 'win':
	case 'win32': {
		platform = 'Windows ' + os.release();
		if (process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
			platform += ' x64';
		}
		break;
	}
	case 'linux': {
		platform = 'Linux ' + os.release();
		break;
	}
	default: {
		platform = process.platform + ' ' + os.release();
		break;
	}
}

// Format browser-y and include node version.
const userAgent = `Appcelerator/${version} (${platform}${lang}) nodejs/${process.versions.node} Version/${version} Safari/0.0.0`;

// Export for mixin.
module.exports = userAgent;
