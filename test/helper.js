var ConfigLoader = require('./conf/loader').load(),
	_= require('underscore'),
	registry = require('appc-registry-sdk'),
	should = require('should'),
	gm = require('gmail'),
	mailParser = require('mailparser').MailParser,
	gmStart = new Date(),
	gmail = new gm.GMailInterface(),
	twilio = require('twilio'),
	twclient = twilio(global.$config.twilio.account_sid,global.$config.twilio.auth_token);

exports.setEnvironment = setEnvironment ;
exports.findEnvs = findEnvs;
exports.fakeUser = getFakeUser();
exports.cloneSession = cloneSession;
exports.getCloudEnvironment = getCloudEnvironment;
exports.registryLogin = registryLogin;
exports.getAuthCode = getAuthCode;

function getCloudEnvironment(sdk, session, type, name, callback) {
	try {
		return callback(null, sdk.Cloud.getEnvironment(session, type, name));
	} catch (err) {
		return callback(err);
	}
}

function registryLogin(username, password, registryURL, callback) {
	var api = new registry('login');
	api.baseurl = registryURL || 'https://software.appcelerator.com';
	api.body({
		username: username,
		password: password,
		ipaddress: '0.0.0.0',
		fingerprint: 'unittest',
		fingerprint_description: 'unittest'
	});
	api.send(function (err, res) {
		if (err) { return callback(err); }
		if (res && res.body && res.body.session) {
			return callback(null, res.body.session);
		} else {
			return callback(new Error('Malformed response from registry'));
		}
	});
}

function findEnvs(ignoreConf) {
	var envs = ['production', 'development', 'local'];
	if (global.$config.environments && !ignoreConf) {
		for (var key in global.$config.environments) {
			var index = envs.indexOf(key),
				exists = index > -1;
			if (_.isEmpty(global.$config.environments[key]) || !global.$config.environments[key].baseurl) {
				if (exists) {
					envs.splice(index, 1);
				}
			} else {
				if (!exists) {
					envs.push(key);
				}
			}
		}
	}
	return envs;
}

/*
 * Returns the environment specified.
 * Returns false if the env is to be skipped or does not exist
 * Returns default if nothing is set in the config
 */
function getEnvironment(env, envs, ignoreConf) {

	if (typeof envs === "boolean" ) {
		ignoreConf = envs;
		envs = null;
	}
	if (!envs) {
		envs = findEnvs(ignoreConf);
	}
	if (envs.indexOf(env) === -1) {
		// Environment either doesn't exist or should be skipped
		return false;
	}

	if (global.$config.environments[env] && !ignoreConf) {
		// env is in the config
		return {
			"baseurl": global.$config.environments[env].baseurl,
			"isProduction": typeof global.$config.environments[env].isProduction !== 'undefined' ? global.$config.environments[env].isProduction : false,
			"supportUntrusted": typeof global.$config.environments[env].supportUntrusted !== 'undefined' ? global.$config.environments[env].supportUntrusted : true
		};
	} else {
		// get the default
		return 'default';
	}
}

/*
 * Sets the environment to the one which the string specified represents.
 * Returns true if successful, and false on a failure to find the environment specified
 */
function setEnvironment(sdk, env, envs, ignoreConf) {

	if (typeof envs === "boolean" ) {
		ignoreConf = envs;
		envs = null;
	}

	var gotEnv = getEnvironment(env, envs, ignoreConf);
	if (!gotEnv) {
		return false;
	} else if (gotEnv === 'default') {
		switch(env) {
			case "production":
				sdk.setProduction();
				break;
			case "development":
				sdk.setDevelopment();
				break;
			case "local":
				sdk.setLocal();
				break;
			default :
				sdk.setEnvironment();
				break;
		}
	} else {
		sdk.setEnvironment(gotEnv);
	}
	return true;
}

function getFakeUser() {
	return {
		"username" : "fake_" + Date.now(),
		"password" : "test"
	};
}

function cloneSession(session) {
	var clone = _.map(clone, _.clone(session));
	clone._invalidate = session._invalidate;
	clone._set = session._set;
	clone.invalidate = session.invalidate;
	clone.isValid = session.isValid;
	return clone;
}

/**
 * Fetch the auth code which was sent via email or sms
 * @param method     email or sms
 * @param callback   The callback to fire when finished
 */
function getAuthCode(method, callback) {
	switch (method) {
		case 'sms':
			getLastSMS(callback);
			break;
		case 'email':
			loginGmail(global.$config.gmail.email, global.$config.gmail.password, function(err) {
				if (err) { return callback (err); }
				retryGetLastEmail(5000, 10, function(err, email) {
					if (email && email.html && email.html.match(/Authorization Code: <b>([0-9]{4})/)) {
						return callback(null, email.html.match(/Authorization Code: <b>([0-9]{4})/)[1]);
					} else {
						return callback (err || 'No email found');
					}
				});
			});
			break;
		default:
			callback(new Error('Invalid method specified'));
	}
}

/**
 * Log in to gmail using the provided email and password.
 *
 * @param email     Email address to log in to
 * @param password  Password to use during log in
 * @param callback  The callback to fire when finished
 *
 * @returns         Any errors that occurred during login
 */
function loginGmail(email, password, callback){
	gmail.connect(email, password, function (err) {
		callback(err);
	});
}

/**
 * Retrieve the most recent email in the inbox.
 *
 * @param callback  The callback to fire when finished
 *
 * @returns {Error} No emails could be found
 * @returns {JSON}  The most recent email in the inbox
 */
function getLastEmail(callback) {
	var fetcher = gmail.get({
			since: gmStart
		}),
		lastMessageId,
		lastMessage;

	fetcher.on('fetching', function (ids, cancel) {
		if (ids.length === 0) {
			cancel();
			return callback(new Error('No emails in the inbox'), null);
		} else {
			lastMessageId = ids[ids.length - 1];
		}
	});

	fetcher.on('fetched', function (message) {
		message.should.have.property('uid');
		// we are interested in the last message
		if (+message.uid === +lastMessageId) {
			lastMessage = message.eml;
		}
	});

	fetcher.on('end', function () {
		// Parse the email after it has been received
		var parser = new mailParser();
		parser.on('end', function (mail) {
			callback(null, mail);
		});
		parser.write(lastMessage);
		parser.end();
	});
}

/**
 * a basic method to re-call a function until no error occurs or .
 * @param fn
 * @param timeout
 * @param times
 * @param cb
 */
function retryGetLastEmail(timeout, times, cb) {
	setTimeout(function() {
		getLastEmail(function (err, res) {
			if (err) {
				if (!--times) {
					return cb(err);
				}
				retryGetLastEmail(timeout, times, cb);
			} else {
				return cb(err, res);
			}
		});
	}, timeout);
}

function getLastSMS(callback) {
	twclient.sms.messages.list(function(err,results){
		for (var c=0;c<results.sms_messages.length;c++) {
			var message = results.sms_messages[c];
			if (message.direction === 'inbound') {
				var match = /Appcelerator (device|phone) (authorization|verification) code: (\d{4})/.exec(message.body);
				if (match && match.length) {
					callback(null, match[3]);
					break;
				}
			}
		}
	});
}