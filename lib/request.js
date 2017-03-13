'use strict';

const request = require('request');

module.exports = function (Appc) {

	/**
	 * Create a request to the platform and return the request object
	 *
	 * @param  {Object} session - session
	 * @param  {string} path - path
	 * @param  {string} method - method
	 * @param  {Function} callback - callback
	 * @param  {Function} mapper - mapper
	 * @param  {Object} json - json
	 * @return {Object} - request object
	 */
	Appc.createRequest = function createRequest(session, path, method, callback, mapper, json) {
		if (typeof method === 'function') {
			json = mapper;
			mapper = callback;
			callback = method;
			method = 'get';
		}
		if (typeof mapper === 'object') {
			json = mapper;
			mapper = null;
		}
		let responseHandler = createAPIResponseHandler(callback || function () {}, mapper || null, path);
		return _createRequest(session, path, method, responseHandler, json);
	};

	/**
	 * create APIResponseHandler
	 */
	Appc.createAPIResponseHandler = function createAPIResponseHandler(callback, mapper, path) {
		return function (err, resp, body) {
			debug('api response, err=%o, body=%o', err, body);
			if (err) {
				return callback(err);
			}
			try {
				let ct = resp.headers['content-type'],
					isJSON = ct && ct.indexOf('/json') > 0;
				body = typeof body === 'object' ? body : isJSON && JSON.parse(body) || body;
				if (!body.success) {
					debug('api body failed, was: %o', body);
					let description = typeof body.description === 'object' ? body.description.message : body.description || 'unexpected response from the server';
					let error = new Error(description);
					error.success = false;
					error.description = description;
					error.code = body.code;
					error.internalCode = body.internalCode;
					typeof body === 'string' && (error.content = body);
					return callback(error);
				}
				if (mapper) {
					return mapper(body.result, callback, resp);
				}
				return callback(null, body.result || body, resp);
			}
			catch(E) {
				return callback(E, body, resp);
			}
		};
	};

	/**
	 * Create a request to the platform and return the request object. this time with a custom handler
	 *
	 * @param  {Object} session - session
	 * @param  {string} path - path
	 * @param  {string} method - method
	 * @param  {string} responseHandler - responseHandler
	 * @param  {Object} json - json
	 * @return {Object} - request object
	 */
	Appc.createRequestCustomResponseHandler = function createRequestCustomResponseHandler(session, path, method, responseHandler, json) {
		if (typeof method === 'function') {
			json = responseHandler;
			responseHandler = method;
			method = 'get';
		}
		return _createRequest(session, path, method, responseHandler, json);
	};

	/**
	 * Wrapper for existing functions which use createRequestObject.
	 * This allows xauth token or session to be specified when creating an object
	 */
	function createRequestObject(auth, url) {
		if (typeof auth === 'object') {
			// auth is a session
			return _createRequestObject(auth, url);
		}
		if (typeof auth === 'string') {
			// auth is a token
			return _createRequestObject(url, auth);
		}
	}

	/**
	 * Create request object
	 */
	function _createRequestObject(session, url, authToken) {
		if (typeof session === 'object') {
			if (!session || !session.jar) {
				throw new Error('session is not valid');
			}
			if (!url) {
				url = session;
			}
		}
		if (typeof session === 'string') {
			authToken = url;
			url = session;
			session = null;
		}
		let opts = {
			url: url,
			headers: {
				'User-Agent': Appc.userAgent
			},
			timeout: 30000,
			forever: true
		};

		if (process.env.APPC_CONFIG_PROXY && process.env.APPC_CONFIG_PROXY !== 'undefined') {
			opts.proxy = process.env.APPC_CONFIG_PROXY;
		}

		if (process.env.APPC_CONFIG_CAFILE) {
			opts.ca = fs.readFileSync(process.env.APPC_CONFIG_CAFILE);
		}

		if (process.env.Appc_CONFIG_STRICTSSL === 'false') {
			opts.strictSSL = false;
		}

		// support self-signed certificates
		if (Appc.supportUntrusted) {
			opts.agent = false;
			opts.rejectUnauthorized = false;
		}
		if (authToken) {
			opts.headers['x-auth-token'] = authToken;
		}
		if (session) {
			opts.jar = session.jar;
		}
		debug('fetching', url, 'sid=', session && session.id, 'userAgent=', opts.headers['User-Agent']);
		return opts;

	}

	/**
	 * Create a request
	 *
	 * @param  {Object} session - session
	 * @param  {string} path - path
	 * @param  {string} method - method
	 * @param  {string} responseHandler - responseHandler
	 * @param  {Object} json - json
	 * @return {Object} - request object
	 */
	function _createRequest(session, path, method, responseHandler, json) {
		try {
			if (path[0] === '/') {
				path = require('url').resolve(Appc.baseurl, path);
			}
			let obj = createRequestObject(session, path);
			if (json) {
				obj.json = json;
			}
			return request[method.toLowerCase()](obj, responseHandler);
		} catch(e) {
			responseHandler(e);
			// don't return the callback since it expects a request
		}
	}
};
