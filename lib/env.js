'use strict';

const debug = require('debug')('Appc:sdk:env');

const envs = {
	Production: {
		baseurl: 'https://platform.axway.com',
		registryurl: 'https://registry.platform.axway.com',
		pubsuburl: 'https://pubsub.platform.axway.com',
		isProduction: true,
		supportUntrusted: false,
		secureCookies: true
	},
	Preproduction: {
		baseurl: 'https://platform-preprod.axwaytest.net',
		registryurl: 'https://registry.axwaytest.net',
		pubsuburl: 'https://pubsub.axwaytest.net',
		isProduction: false,
		supportUntrusted: true,
		secureCookies: true
	},
	ProductionEU: {
		baseurl: 'https://platform-eu.appcelerator.com',
		registryurl: 'https://software-eu.appcelerator.com',
		pubsuburl: 'https://pubsub.appcelerator.com',
		isProduction: true,
		supportUntrusted: false,
		secureCookies: true
	}
};

const platformMap = {
	baseurl: 'APPC_DASHBOARD_URL',
	registryurl: 'APPC_REGISTRY_SERVER',
	pubsuburl: 'APPC_PUBSUB_URL',
	supportUntrusted: 'APPC_SUPPORT_UNTRUSTED',
	secureCookies: 'APPC_SECURE_COOKIES'
};

let Env = exports = module.exports = {};

// List env props to wrap with accessors.
Env.props = Object.keys(envs.Production);

// Set analytics URL.
Env.analyticsurl = 'https://api.appcelerator.net/p/v2/partner-track';

/**
 * Map default envs to setter functions.
 */
Object.keys(envs).forEach(function (env) {
	Env['set' + env] = function () {
		Object.assign(Env, envs[env]);
		debug('set env to', env, ', baseurl is', Env.baseurl);
		_inheritEnvVars();
	};
});

// Alias setPreproduction as setDevelopment.
Env.setDevelopment = Env.setPreproduction;

/**
 * set the base url to use local development
 */
Env.setLocal = function setLocal() {
	Env.setPreproduction();
	Env.baseurl = 'http://localhost:9009';
	Env.secureCookies = false;
	Env.isProduction = false;
	debug('set env to local, baseurl is', Env.baseurl);
};

/**
 * set a custom environment, use local config as defaults
 *
 * @param {object} opts options
 */
Env.setEnvironment = function setEnvironment(opts) {
	opts = opts || {};
	opts.baseurl && (Env.baseurl = opts.baseurl.trim());
	opts.registryurl && (Env.registryurl = opts.registryurl.trim());
	opts.pubsuburl && (Env.pubsuburl = opts.pubsuburl.trim());
	typeof opts.isProduction !== 'undefined' && (Env.isProduction = opts.isProduction);
	typeof opts.supportUntrusted !== 'undefined' && (Env.supportUntrusted = opts.supportUntrusted);
	typeof opts.secureCookies !== 'undefined' && (Env.secureCookies = opts.secureCookies);
	debug('set custom environment to ' + JSON.stringify(opts));
};

/**
 * Test NODE_ENV, APPC_ENV, and NODE_ACS_URL values to see if they are preproduction-ish.
 * @return {boolean} - true if yes
 */
function _isPreproduction() {
	return (process.env.NODE_ACS_URL && ~process.env.NODE_ACS_URL.indexOf('.appctest.com'))
		|| _isEnv([ 'preproduction', 'development' ]);
}

/**
 * Test NODE_ENV and APPC_ENV values to see if they match env name(s).
 *
 * @param {array|any} envs array of environments objects
 * @return {boolean} true if yes
 */
function _isEnv(envs) {
	if (!Array.isArray(envs)) {
		envs = [ envs ];
	}
	return ~envs.indexOf(process.env.NODE_ENV)
		|| ~envs.indexOf(process.env.APPC_ENV);
}

/**
 * Test NODE_ENV and APPC_ENV values to see if they match env name(s).
 * @return {String} - envs key name
 */
function _getEnvKey() {
	if (_isPreproduction()) {
		return 'Preproduction';
	}
	if (_isEnv('production-eu')) {
		return 'ProductionEU';
	}
	if (_isEnv('platform-axway')) {
		return 'PlatformAxway';
	}
	return 'Production';
}

/**
 * Check process.env vars for override values.
 * @return {void}
 */
function _inheritEnvVars() {
	Object.keys(platformMap).forEach(function (prop) {
		let name = platformMap[prop];
		let val = process.env[name];

		if (typeof val !== 'undefined') {
			// Lowercase and handle boolean values.
			val = String(val).toLowerCase();
			val === 'true' && (val = true);
			val === 'false' && (val = false);

			// Override prop if env var differs.
			Env[prop] !== val && (Env[prop] = val);
		}
	});
}

// Set default env based on NODE_ENV/APPC_ENV.
let defaultEnv = _getEnvKey();
Env['set' + defaultEnv]();
