'use strict';

const debug = require('debug')('Appc:sdk:env');

const envs = {
	Production: {
		baseurl: 'https://platform.appcelerator.com',
		registryurl: 'https://software.appcelerator.com',
		pubsuburl: 'https://pubsub.appcelerator.com',
		webeventurl: 'https://webevent.appcelerator.com',
		cacheurl: 'https://cache.appcelerator.com',
		isProduction: true,
		supportUntrusted: false,
		secureCookies: true
	},
	Preproduction: {
		baseurl: 'https://360-preprod.cloud.appctest.com',
		registryurl: 'https://software-preprod.cloud.appctest.com',
		pubsuburl: 'https://pubsub-preprod.cloud.appctest.com',
		webeventurl: 'https://webevent-preprod.cloud.appctest.com',
		cacheurl: 'https://cache-preprod.cloud.appctest.com',
		isProduction: false,
		supportUntrusted: true,
		secureCookies: true
	},
	ProductionEU: {
		baseurl: 'https://platform-eu.appcelerator.com',
		registryurl: 'https://software-eu.appcelerator.com',
		pubsuburl: 'https://pubsub.appcelerator.com',
		webeventurl: 'https://webevent.appcelerator.com',
		cacheurl: 'https://cache.appcelerator.com',
		isProduction: true,
		supportUntrusted: false,
		secureCookies: true
	},
	PlatformAxway: {
		baseurl: 'https://portal.cloudapp.axway.com',
		registryurl: 'https://marketplace.cloudapp.axway.com',
		pubsuburl: 'https://pubsub.appcelerator.com',
		webeventurl: 'https://webevent.appcelerator.com',
		cacheurl: 'https://cache.appcelerator.com',
		isProduction: true,
		supportUntrusted: false,
		secureCookies: true
	}
};

let Env = exports = module.exports = {};

// List env props to wrap with accessors.
Env.props = Object.keys(envs.Production);

// Set analytics URL.
const analyticsUrl = 'https://api.appcelerator.net/p/v2/partner-track';
Env.analyticsurl = analyticsUrl;

/**
 * Map default envs to setter functions.
 */
Object.keys(envs).forEach(function (env) {
	Env['set' + env] = function () {
		Object.assign(Env, envs[env]);
		debug('set env to', env, ', baseurl is', Env.baseurl);
	};
});

// Alias setPreproduction as setDevelopment.
Env.setDevelopment = Env.setPreproduction;

/**
 * set the base url to use local development
 */
Env.setLocal = function setLocal(opts) {
	Env.setPreproduction();
	Env.baseurl = 'http://localhost:9009';
	Env.secureCookies = false;
	Env.isProduction = false;
	debug('set env to local, baseurl is', Env.baseurl);
};

/**
 * set a custom environment, use local config as defaults
 */
Env.setEnvironment = function setEnvironment(opts) {
	opts = opts || {};
	let base = envs[_isPreproduction() ? 'Preproduction' : 'Production'];
	Env.baseurl = (opts.baseurl || base.baseurl).trim();
	Env.registryurl = (opts.registry || base.registryurl).trim();
	Env.pubsuburl = (opts.pubsub || base.pubsuburl).trim();
	Env.webeventurl = (opts.webevent || base.webeventurl).trim();
	Env.cacheurl = (opts.cache || base.cacheurl).trim();
	Env.isProduction = typeof opts.isProduction !== 'undefined' ? opts.isProduction : base.isProduction;
	Env.supportUntrusted = typeof opts.supportUntrusted !== 'undefined' ? opts.supportUntrusted : base.supportUntrusted;
	Env.secureCookies = typeof opts.secureCookies !== 'undefined' ? opts.secureCookies : base.secureCookies;
	debug('set custom environment ' + JSON.stringify(opts) + ' to ' + Env.baseurl);
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
 * @return {boolean} - true if yes
 */
function _isEnv(envs) {
	if (!Array.isArray(envs)) {
		envs = [ envs ];
	}
	return ~envs.indexOf(process.env.NODE_ENV)
		|| ~envs.indexOf(process.env.APPC_ENV);
}

// Set default env based on NODE_ENV/APPC_ENV.
let setDefaultEnv = _isPreproduction() ? 'setPreproduction'
	: _isEnv('production-eu') ? 'setProductionEU'
	: _isEnv('platform-axway') ? 'setPlatformAxway'
	: 'setProduction';

Env[setDefaultEnv]();
