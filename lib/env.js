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

const analyticsUrl = 'https://api.appcelerator.net/p/v2/partner-track';

module.exports = function (Appc) {

	/**
	 * Map default envs to setter functions.
	 */
	Object.keys(envs).forEach(function (env) {
		Appc['set' + env] = function () {
			Object.assign(Appc, envs[env]);
			debug('set env to', env, ', baseurl is', Appc.baseurl);
		};
	});

	// Alias setPreproduction as setDevelopment.
	Appc.setDevelopment = Appc.setPreproduction;

	/**
	 * set the base url to use local development
	 */
	Appc.setLocal = function setLocal(opts) {
		Appc.setPreproduction();
		Appc.baseurl = 'http://localhost:9009';
		Appc.secureCookies = false;
		Appc.isProduction = false;
		debug('set env to local, baseurl is', Appc.baseurl);
	};

	/**
	 * set a custom environment, use local config as defaults
	 */
	Appc.setEnvironment = function setEnvironment(opts) {
		opts = opts || {};
		let base = envs[_isPreproduction() ? 'Preproduction' : 'Production'];
		Appc.baseurl = (opts.baseurl || base.baseurl).trim();
		Appc.registryurl = (opts.registry || base.registryurl).trim();
		Appc.pubsuburl = (opts.pubsub || base.pubsuburl).trim();
		Appc.webeventurl = (opts.webevent || base.webeventurl).trim();
		Appc.cacheurl = (opts.cache || base.cacheurl).trim();
		Appc.isProduction = typeof opts.isProduction !== 'undefined' ? opts.isProduction : base.isProduction;
		Appc.supportUntrusted = typeof opts.supportUntrusted !== 'undefined' ? opts.supportUntrusted : base.supportUntrusted;
		Appc.secureCookies = typeof opts.secureCookies !== 'undefined' ? opts.secureCookies : base.secureCookies;
		debug('set custom environment ' + JSON.stringify(opts) + ' to ' + Appc.baseurl);
	};

	// Set analytics URL.
	Appc.analyticsurl = analyticsUrl;

	// Set default env based on NODE_ENV/APPC_ENV.
	if (_isPreproduction()) {
		return Appc.setPreproduction();
	}

	if (process.env.NODE_ENV === 'production-eu' || process.env.Appc_ENV === 'production-eu') {
		return Appc.setProductionEU();
	}

	if (process.env.NODE_ENV === 'platform-axway' || process.env.Appc_ENV === 'platform-axway') {
		return Appc.setPlatformAxway();
	}

	// if actually running locally, the logic assumes production though
	Appc.setProduction();

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
};
