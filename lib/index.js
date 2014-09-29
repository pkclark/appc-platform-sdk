var pkg = require('../package.json');

function AppC() {
}

exports = module.exports = AppC;

AppC.baseurl = 'https://dashboard.appcelerator.com';

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
	return opts;
}

function createAPIResponseHandler(callback, mapper) {
	return function(err,resp,body) {
		if (err) return callback(err);
		try {
			body = typeof(body)==='object' ? body : JSON.parse(body);
			if (!body.success) {
				var error = new Error(body.description);
				error.code = body.code;
				error.internalCode = body.internalCode;
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
