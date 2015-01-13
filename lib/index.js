/**
 * This source code is the intellectual property of Appcelerator, Inc.
 * Copyright (c) 2014-2015 Appcelerator, Inc. All Rights Reserved.
 * See the LICENSE file distributed with this package for
 * license restrictions and information about usage and distribution.
 */
var pkg = require('../package.json'),
	debug = require('debug')('appc:sdk'),
	request = require('request-ssl'),
	urllib = require('url');

function AppC() {
}

exports = module.exports = AppC;

AppC.Auth = require('./auth');
AppC.Org = require('./org');
AppC.User = require('./user');
AppC.App = require('./app');
AppC.Notification = require('./notification');
AppC.Feed = require('./feed');
AppC.Cloud = require('./cloud');

AppC.version = pkg.version;
AppC.userAgent = pkg.name+'/'+pkg.version;

AppC.createAPIResponseHandler = createAPIResponseHandler;
AppC.createRequestObject = createRequestObject;
AppC.createRequest = createRequest;

/**
 * setup our known fingerprints for our platform
 */
request.addFingerprint('dashboard.appcelerator.com', '33:55:D7:05:13:51:BE:6A:3A:09:9E:DC:C4:9A:80:83:77:6A:DF:74');
request.addFingerprint('360-preprod.appcelerator.com', '33:55:D7:05:13:51:BE:6A:3A:09:9E:DC:C4:9A:80:83:77:6A:DF:74');
request.addFingerprint('api.cloud.appcelerator.com','89:B5:37:A4:92:45:A0:A3:81:23:40:FE:CB:72:C3:E4:70:EF:D3:AE');
request.addFingerprint('dolphin-secure-identity.cloud.appcelerator.com','33:55:D7:05:13:51:BE:6A:3A:09:9E:DC:C4:9A:80:83:77:6A:DF:74');
request.addFingerprint('admin.cloudapp-enterprise-preprod.appctest.com','8F:2E:D1:CE:D4:5C:42:0A:86:55:E9:70:14:91:94:5D:F2:7C:43:D6');
request.addFingerprint('preprod-api.cloud.appctest.com','31:2E:47:2F:D2:6A:4C:2E:CF:7B:8C:91:7E:7D:77:3D:B1:39:74:54');

/**
 * set the base url to use production
 */
AppC.setProduction = function setProduction() {
	AppC.baseurl = 'https://dashboard.appcelerator.com';
	AppC.isProduction = true;
	AppC.supportUntrusted = false;
	debug('set production to '+AppC.baseurl);
};

/**
 * set the base url to use development
 */
AppC.setDevelopment = function setDevelopment() {
	AppC.baseurl = 'https://360-preprod.appcelerator.com';
	AppC.isProduction = false;
	AppC.supportUntrusted = true;
	debug('set dev to '+AppC.baseurl);
};

/**
 * set the base url to use local development
 */
AppC.setLocal = function setLocal() {
	AppC.baseurl = 'https://360-local.appcelerator.com:8443';
	AppC.isProduction = false;
	AppC.supportUntrusted = true;
	debug('set local to '+AppC.baseurl);
};


// set DEFAULT to production host
AppC.setProduction();

function createRequestObject(session,url) {
	if (!session || !session.jar) {
		throw new Error("session invalid");
	}
	var opts = {
		url: url || session,
		jar: session.jar,
		headers: {
			'User-Agent': AppC.userAgent
		}
	};
	// support self-signed certificates
	if (AppC.supportUntrusted) {
		opts.agent = false;
		opts.rejectUnauthorized = false;
	}
	debug('fetching',url);
	return opts;
}

function createAPIResponseHandler(callback, mapper) {
	return function(err,resp,body) {
		debug('api response, err=%o, body=%o',err,body);
		if (err) { return callback(err); }
		try {
			var ct = resp.headers['content-type'],
				isJSON = ct && ct.indexOf('/json') > 0;
			body = typeof(body)==='object' ? body : isJSON && JSON.parse(body) || body;
			if (!body.success) {
				debug('api body failed, was: %o',body);
				var description = typeof(body.description)==='object' ? body.description.message : body.description || 'unexpected response from the server';
				var error = new Error(description);
				error.code = body.code;
				error.internalCode = body.internalCode;
				typeof(body)==='string' && (error.content = body);
				return callback(error);
			}
			if (mapper) {
				return mapper(body.result,callback);
			}
			return callback(null, body.result);
		}
		catch (E) {
			return callback(E, body);
		}
	};
}

/**
 * create a request to the platform and return the request object
 */
function createRequest(session, path, method, callback) {
	if (typeof(method)==='function') {
		callback = method;
		method = 'get';
	}
	var url = urllib.resolve(AppC.baseurl, path);
	return request[method.toLowerCase()](AppC.createRequestObject(session,url),AppC.createAPIResponseHandler(callback));
}
