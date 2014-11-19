var pkg = require('../package.json');

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

/**
 * set the base url to use production
 */
AppC.setProduction = function setProduction() {
	AppC.baseurl = 'https://dashboard.appcelerator.com';
	AppC.isProduction = true;
	AppC.supportUntrusted = false;
};

/**
 * set the base url to use development
 */
AppC.setDevelopment = function setDevelopment() {
	AppC.baseurl = 'https://360-preprod.appcelerator.com';
	AppC.isProduction = false;
	AppC.supportUntrusted = true;
};

/**
 * set the base url to use local development
 */
AppC.setLocal = function setLocal() {
	AppC.baseurl = 'https://360-local.appcelerator.com:8443';
	AppC.isProduction = false;
	AppC.supportUntrusted = true;
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
	}
	// support self-signed certificates
	if (AppC.supportUntrusted) {
		opts.agent = false;
		opts.rejectUnauthorized = false;
	}
	process.env.DEBUG && console.log(url);
	return opts;
}

function createAPIResponseHandler(callback, mapper) {
	return function(err,resp,body) {
		if (err) return callback(err);
		try {
			process.env.DEBUG && console.log(body);
			var ct = resp.headers['content-type'],
				isJSON = ct && ct.indexOf('/json') > 0;
			body = typeof(body)==='object' ? body : isJSON && JSON.parse(body) || body;
			if (!body.success) {
				var error = new Error(body.description || 'unexpected response from server');
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
	}
}
