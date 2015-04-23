var ConfigLoader = require('./conf/loader'),
	_= require('underscore'),
	registry = require('appc-registry-sdk'),
	webdriverio = require('webdriverio'),
	should = require('should'),
	loggedIn = false;

ConfigLoader.load();
var browser = webdriverio.remote(global.$config.browserConfig);

exports.setEnvironment = setEnvironment;
exports.findEnvs = findEnvs;
exports.fakeUser = getFakeUser();
exports.cloneSession = cloneSession;
exports.getCloudEnvironment = getCloudEnvironment;
exports.registryLogin = registryLogin;
exports.getAuthCode = getAuthCode;
exports.loginGmail = loginGmail;
exports.deleteEmails = deleteEmails;
exports.startBrowser = function () { browser.init(); };
exports.stopBrowser = function () { browser.end(); };

browser.
	addCommand('loginGmail', function (done) {
		this.pause(10000)
			.url('https://gmail.com')
			.getTitle(function (err, result) {
				should.not.exist(err);
				result.should.endWith("Gmail");
			})
			.call(function (){
				if (loggedIn){
					console.log('already logged in');
					browser
						.call(done);
				} else {
					console.log('logging into gmail');
					browser
						.waitFor('input[name="Email"]', 20000, expectNoErr)
						.element('css selector', 'input[name="Email"]', expectNoErr)
						.pause(1000)
						.addValue('input[name="Email"]', global.$config.gmail.email, expectNoErr)
						.pause(1000)
						.addValue('input[name="Passwd"]', global.$config.gmail.password, expectNoErr)
						.pause(10000)
						.click('input[name="signIn"]')
						.waitFor('div.ov', 10000, function (err, result) {
							if (!err) {
								loggedIn = true;
							}
							browser.call(done);
						}
					);
				}
			});
	})
	.addCommand('deleteEmails', function (done) {
		this.pause(10000)
			.url('https://gmail.com')
			.getTitle(function (err, result) {
				should.not.exist(err);
				result.should.endWith("Gmail");
			})
			.call(function (){
				if (loggedIn){
					console.log('already logged in');
					browser
						.call(poll);
				} else {
					browser
						.loginGmail(poll);
				}
			});
		function poll(){
			browser
				.pause(10000)
				.url("https://gmail.com", expectNoErr)
				.waitFor('div.ov', 10000, function (err, result){
					console.log('finding select all button');
					if (err){
						console.log('select all button not found, try again...');
						setTimeout(poll, 10000);
					} else {
						console.log('select all button found');
						browser
							.pause(2000)
							.waitFor('span.T-Jo', 10000, expectNoErr)
							.click('span.T-Jo', expectNoErr)
							.pause(1000)
							.click('.ar9', function () {
								console.log('clicked delete button');
								browser
									.pause(1000)
									.call(done);
							})

					}
				}
			);
		}
	})
	.addCommand('getAuthCode', function (done){
		this.pause(10000)
			.url('https://gmail.com')
			.getTitle(function (err, result) {
				should.not.exist(err);
				result.should.endWith("Gmail");
			})
			.call(function (){
				if (loggedIn){
					console.log('already logged in');
					browser
						.call(poll);
				} else {
					browser
						.loginGmail(poll);
				}
			});
		function poll(){
			browser
				.pause(10000)
				.url("https://gmail.com", expectNoErr)
				.waitFor('span[email="noreply@appcelerator.com"].zF', 10000, function (err, result){
					console.log('waiting for auth email');
					if (err){
						console.log('email not found, waiting...');
						setTimeout(poll, 10000);
					} else {
						console.log('email found');
						browser
							.pause(2000)
							.waitFor('.y6', 10000, expectNoErr)
							.click('.y6', expectNoErr)
							.waitFor('p[style="font-family:Helvetica,sans-serif;font-size:14px;line-height:20px;margin-left:20px;margin-right:20px;color:#333333"] b', 10000, expectNoErr)
							.getText('p[style="font-family:Helvetica,sans-serif;font-size:14px;line-height:20px;margin-left:20px;margin-right:20px;color:#333333"] b', function (err, result) {
								console.log('found auth code: ' + result);
								done(null, result);
							}
						);
					}
				}
			);
		}
	});

function deleteEmails(callback) {
	browser.deleteEmails(callback);
}

function getAuthCode(callback) {
	browser.getAuthCode(callback);
}

function loginGmail(callback) {
	browser.loginGmail(callback);
}

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
	if (conf.environments && !ignoreConf) {
		for (var key in conf.environments) {
			var index = envs.indexOf(key),
				exists = index > -1;
			if (_.isEmpty(conf.environments[key]) || !conf.environments[key].baseurl) {
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
	if (envs.indexOf(env) == -1) {
		// Environment either doesn't exist or should be skipped
		return false;
	}

	if (conf.environments[env] && !ignoreConf) {
		// env is in the config
		return {
			"baseurl": conf.environments[env].baseurl,
			"isProduction": typeof conf.environments[env].isProduction !== 'undefined' ? conf.environments[env].isProduction : false,
			"supportUntrusted": typeof conf.environments[env].supportUntrusted !== 'undefined' ? conf.environments[env].supportUntrusted : true
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

function expectNoErr() {
	return function (err, res) {
		should.not.exist(err);
	};
}

