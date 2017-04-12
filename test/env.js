'use strict';

const path = require('path');

const should = require('should');

let Appc = require('../');
let currentEnv = {};

describe('Appc.Env', function () {

	before(function (done) {
		currentEnv = {
			baseurl: Appc.baseurl,
			registryurl: Appc.registryurl,
			pubsuburl: Appc.pubsuburl,
			webeventurl: Appc.webeventurl,
			cacheurl: Appc.cacheurl,
			secureCookies: Appc.secureCookies,
			supportUntrusted: Appc.supportUntrusted
		};
		done();
	});

	after(function (done) {
		Appc.setEnvironment(currentEnv);
		Appc.baseurl.should.equal(currentEnv.baseurl);
		Appc.registryurl.should.equal(currentEnv.registryurl);
		Appc.webeventurl.should.equal(currentEnv.webeventurl);
		Appc.cacheurl.should.equal(currentEnv.cacheurl);
		Appc.pubsuburl.should.equal(currentEnv.pubsuburl);
		Appc.secureCookies.should.equal(currentEnv.secureCookies);
		Appc.supportUntrusted.should.equal(currentEnv.supportUntrusted);
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
				Appc.isProduction.should.equal(true);
			} else {
				Appc.isProduction.should.equal(false);
			}
		});

		it('should be production', function () {
			Appc.setProduction();
			Appc.isProduction.should.equal(true);
		});

		it('should not be production when set to development', function () {
			Appc.setDevelopment();
			Appc.isProduction.should.equal(false);
		});

		it('should not be production when set to local', function () {
			Appc.setLocal();
			Appc.isProduction.should.equal(false);
		});

		it('should be able to be changed', function () {
			Appc.setDevelopment();
			Appc.isProduction.should.equal(false);
			Appc.setProduction();
			Appc.isProduction.should.equal(true);
			Appc.setLocal();
			Appc.isProduction.should.equal(false);
		});
	});

	describe('custom environments', function () {

		it('should allow a custom environment', function () {
			let customEnv = {
				baseurl: 'http://test.appcelerator.com:8080/Appc',
				isProduction: false,
				supportUntrusted: true,
				registry: 'http://registry.com',
				webevent: 'http://webevent.com',
				cache: 'http://cache.com',
				pubsub: 'http://pubsub.com'
			};

			Appc.setEnvironment(customEnv);

			Appc.isProduction.should.equal(false);
			Appc.supportUntrusted.should.equal(true);
			Appc.baseurl.should.equal('http://test.appcelerator.com:8080/Appc');
			Appc.registryurl.should.equal('http://registry.com');
			Appc.webeventurl.should.equal('http://webevent.com');
			Appc.cacheurl.should.equal('http://cache.com');
			Appc.pubsuburl.should.equal('http://pubsub.com');
		});
	});

	describe('overrides from process.env', function () {

		it('should use override with ENV variables', function () {
			process.env.APPC_DASHBOARD_URL = 'http://360-env.appcelerator.com';
			process.env.APPC_REGISTRY_SERVER = 'http://software-env.appcelerator.com';
			process.env.APPC_PUBSUB_URL = 'http://pubsub-env.appcelerator.com';
			process.env.APPC_WEBEVENT_URL = 'http://webevent-env.appcelerator.com';
			process.env.APPC_CACHE_URL = 'http://webevent-env.appcelerator.com';
			process.env.APPC_SUPPORT_UNTRUSTED = 'false';
			process.env.APPC_SECURE_COOKIES = 'false';

			delete require.cache[require.resolve('../lib/env')];
			let Env = require('../lib/env');

			Env.secureCookies.should.equal(false);
			Env.supportUntrusted.should.equal(false);
			Env.baseurl.should.equal('http://360-env.appcelerator.com');
			Env.registryurl.should.equal('http://software-env.appcelerator.com');
			Env.pubsuburl.should.equal('http://pubsub-env.appcelerator.com');
			Env.webeventurl.should.equal('http://webevent-env.appcelerator.com');
			Env.cacheurl.should.equal('http://webevent-env.appcelerator.com');
		});
	});
});
