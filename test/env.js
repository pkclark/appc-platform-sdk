'use strict';

const should = require('should');

let Appc = require('../');
let currentEnv = {};

describe('Appc.Env', function () {

	before(function (done) {
		currentEnv = {
			baseurl: Appc.baseurl,
			registryurl: Appc.registryurl,
			pubsuburl: Appc.pubsuburl,
			secureCookies: Appc.secureCookies,
			supportUntrusted: Appc.supportUntrusted
		};
		done();
	});

	after(function (done) {
		Appc.setEnvironment(currentEnv);
		should(Appc.baseurl).equal(currentEnv.baseurl);
		should(Appc.registryurl).equal(currentEnv.registryurl);
		should(Appc.pubsuburl).equal(currentEnv.pubsuburl);
		should(Appc.secureCookies).equal(currentEnv.secureCookies);
		should(Appc.supportUntrusted).equal(currentEnv.supportUntrusted);
		done();
	});

	describe('default environments', function () {

		it('should default env from NODE_ENV or APPC_ENV', function () {
			if (process.env.NODE_ENV === 'production'
				|| process.env.APPC_ENV === 'production'
				|| process.env.NODE_ENV === 'production-eu'
				|| process.env.APPC_ENV === 'production-eu'
				|| process.env.NODE_ENV === 'platform-axway'
				|| process.env.APPC_ENV === 'platform-axway'
				|| !process.env.NODE_ENV
				&&  !process.env.APPC_ENV
			) {
				should(Appc.isProduction).equal(true);
			} else {
				should(Appc.isProduction).equal(false);
			}
		});

		it('should be production', function () {
			Appc.setProduction();
			should(Appc.isProduction).equal(true);
		});

		it('should not be production when set to development', function () {
			Appc.setDevelopment();
			should(Appc.isProduction).equal(false);
		});

		it('should not be production when set to local', function () {
			Appc.setLocal();
			should(Appc.isProduction).equal(false);
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
				isProduction: false,
				supportUntrusted: true,
				registry: 'http://registry.com',
				pubsub: 'http://pubsub.com'
			};

			Appc.setEnvironment(customEnv);

			should(Appc.isProduction).equal(false);
			should(Appc.supportUntrusted).equal(true);
			should(Appc.baseurl).equal('http://test.appcelerator.com:8080/Appc');
			should(Appc.registryurl).equal('http://registry.com');
			should(Appc.pubsuburl).equal('http://pubsub.com');
		});
	});

	describe('overrides from process.env', function () {

		it('should use override with ENV variables', function () {
			process.env.APPC_DASHBOARD_URL = 'http://360-env.appcelerator.com';
			process.env.APPC_REGISTRY_SERVER = 'http://software-env.appcelerator.com';
			process.env.APPC_PUBSUB_URL = 'http://pubsub-env.appcelerator.com';
			process.env.APPC_SUPPORT_UNTRUSTED = 'false';
			process.env.APPC_SECURE_COOKIES = 'false';

			delete require.cache[require.resolve('../lib/env')];
			let Env = require('../lib/env');

			should(Env.secureCookies).equal(false);
			should(Env.supportUntrusted).equal(false);
			should(Env.baseurl).equal('http://360-env.appcelerator.com');
			should(Env.registryurl).equal('http://software-env.appcelerator.com');
			should(Env.pubsuburl).equal('http://pubsub-env.appcelerator.com');
		});
	});
});
