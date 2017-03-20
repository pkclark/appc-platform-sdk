'use strict';

const path = require('path');

const should = require('should');

let Appc;

describe('Appc.Env', function () {

	beforeEach(function () {
		Appc = require('../');
	});

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

	it('should allow a custom environment', function () {

		var customEnv = {
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
