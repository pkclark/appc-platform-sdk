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

// Set default env based on NODE_ENV/APPC_ENV.
if (_isPreproduction()) {
	return Env.setPreproduction();
}

if (process.env.NODE_ENV === 'production-eu' || process.env.Env_ENV === 'production-eu') {
	return Env.setProductionEU();
}

if (process.env.NODE_ENV === 'platform-axway' || process.env.Env_ENV === 'platform-axway') {
	return Env.setPlatformAxway();
}

// if actually running locally, the logic assumes production though
Env.setProduction();

/**
 * Test NODE_ENV, APPC_ENV, and NODE_ACS_URL values to see if they are preproduction-ish.
 * @return {boolean} - true if yes
 */
function _isPreproduction() {
	let preprodEnvs = [ 'preproduction', 'development' ];
	return (process.env.NODE_ACS_URL && ~process.env.NODE_ACS_URL.indexOf('.appctest.com'))
		|| ~preprodEnvs.indexOf(process.env.NODE_ENV)
		|| ~preprodEnvs.indexOf(process.env.APPC_ENV);
}
