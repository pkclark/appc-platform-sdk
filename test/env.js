'use strict';

const should = require('should');

const Appc = require('../');

const currentEnv = {};
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

describe('Appc.Env', function () {

	before(function (done) {
		Object.assign(currentEnv, Appc.props.reduce(function (curr, prop) {
			curr[prop] = Appc[prop];
			return curr;
		}, {}));
		done();
	});

	after(function (done) {
		Appc.setEnvironment(currentEnv);
		should(Appc.baseurl).equal(currentEnv.baseurl);
		should(Appc.registryurl).equal(currentEnv.registryurl);
		should(Appc.pubsuburl).equal(currentEnv.pubsuburl);
		should(Appc.secureCookies).equal(currentEnv.secureCookies);
		should(Appc.supportUntrusted).equal(currentEnv.supportUntrusted);
		should(Appc.isProduction).equal(currentEnv.isProduction);
		done();
	});

	describe('default environments', function () {

		it('should set default env from NODE_ENV or APPC_ENV', function () {
			const isProduction = String(process.env.NODE_ENV).startsWith('production')
				|| String(process.env.APPC_ENV).startsWith('production')
				|| (!process.env.NODE_ENV && !process.env.APPC_ENV);
			should(Appc.isProduction).equal(isProduction);
		});

		it('should be production', function () {
			Appc.setProduction();
			should(Appc.baseurl).equal(envs.Production.baseurl);
			should(Appc.isProduction).equal(envs.Production.isProduction);
		});

		it('should not be production when set to preproduction', function () {
			Appc.setPreproduction();
			should(Appc.baseurl).equal(envs.Preproduction.baseurl);
			should(Appc.isProduction).equal(false);
		});

		it('should not be production when set to development', function () {
			Appc.setDevelopment();
			should(Appc.baseurl).equal(envs.Preproduction.baseurl);
			should(Appc.isProduction).equal(false);
		});

		it('should not be production when set to local', function () {
			Appc.setLocal();
			should(Appc.baseurl).equal('http://localhost:9009');
			should(Appc.isProduction).equal(false);
			should(Appc.secureCookies).equal(false);
		});

		it('should be able to be changed', function () {
			Appc.setDevelopment();
			should(Appc.isProduction).equal(false);
			Appc.setProduction();
			should(Appc.isProduction).equal(true);
			Appc.setLocal();
			should(Appc.isProduction).equal(false);
		});
	});

	describe('custom environments', function () {

		it('should allow a custom environment', function () {
			let customEnv = {
				baseurl: 'http://test.appcelerator.com:8080/Appc',
				registryurl: 'http://registry.com',
				pubsuburl: 'http://pubsub.com',
				isProduction: false,
				secureCookies: false,
				supportUntrusted: true
			};

			Appc.setEnvironment(customEnv);

			should(Appc.baseurl).equal(customEnv.baseurl);
			should(Appc.registryurl).equal(customEnv.registryurl);
			should(Appc.pubsuburl).equal(customEnv.pubsuburl);
			should(Appc.isProduction).equal(customEnv.isProduction);
			should(Appc.secureCookies).equal(customEnv.secureCookies);
			should(Appc.supportUntrusted).equal(customEnv.supportUntrusted);
		});
	});

	describe('overrides from process.env', function () {

		it('should use env variables', function () {
			process.env.APPC_DASHBOARD_URL = 'http://360-env.appcelerator.com';
			process.env.APPC_REGISTRY_SERVER = 'http://software-env.appcelerator.com';
			process.env.APPC_PUBSUB_URL = 'http://pubsub-env.appcelerator.com';
			process.env.APPC_SUPPORT_UNTRUSTED = 'true';
			process.env.APPC_SECURE_COOKIES = 'false';

			delete require.cache[require.resolve('../lib/env')];
			let Env = require('../lib/env');

			should(Env.baseurl).equal('http://360-env.appcelerator.com');
			should(Env.registryurl).equal('http://software-env.appcelerator.com');
			should(Env.pubsuburl).equal('http://pubsub-env.appcelerator.com');
			should(Env.secureCookies).equal(false);
			should(Env.supportUntrusted).equal(true);

			// should not override when setting default envs
			Env.setProduction();

			should(Env.baseurl).equal('http://360-env.appcelerator.com');
			should(Env.registryurl).equal('http://software-env.appcelerator.com');
			should(Env.pubsuburl).equal('http://pubsub-env.appcelerator.com');
			should(Env.secureCookies).equal(false);
			should(Env.supportUntrusted).equal(true);

			// should allow custom overrides
			Env.setEnvironment({ baseurl: 'http://custom.baseurl.com' });

			should(Env.baseurl).equal('http://custom.baseurl.com');
			should(Env.registryurl).equal('http://software-env.appcelerator.com');
			should(Env.pubsuburl).equal('http://pubsub-env.appcelerator.com');
			should(Env.secureCookies).equal(false);
			should(Env.supportUntrusted).equal(true);
		});
	});
});
