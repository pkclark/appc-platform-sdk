'use strict';

const path = require('path');

const should = require('should');

const Appc = require('../');
const helper = require('./lib/helper');

let currentSession;
let user = global.$config.user;

describe('Appc.Cloud', function () {

	this.timeout(50000);

	before(function (done) {
		Appc.setEnvironment(global.$config.environment);

		Appc.Auth.login(user.username, user.password, function (err, session) {
			should.not.exist(err);
			should.exist(session);
			currentSession = session;
			currentSession.isValid().should.equal(true);
			done();
		});
	});

	describe('environments', function () {
		var env = global.$config.env === 'production' ? 'production' : 'development';

		before(function (done) {
			var user = global.$config.user;
			Appc.Auth.login(user.username, user.password, function (err, result) {
				should(result).be.ok();
				should.not.exist(err);
				should.exist(result);
				currentSession = result;
				done();
			});

		});

		it('should get ACS_BASE environment', function (done) {
			helper.getCloudEnvironment(currentSession, Appc.Cloud.ACS_BASE, env, function (err, res) {
				should.exist(res);
				res.should.be.an.string;
				should.not.exist(err);
				done();
			});
		});

		it('should get NODE_ACS environment', function (done) {
			helper.getCloudEnvironment(currentSession, Appc.Cloud.NODE_ACS, env, function (err, res) {
				should.exist(res);
				res.should.be.an.string;
				should.not.exist(err);
				done();
			});
		});

		it('should get AUTH_BASE environment', function (done) {
			helper.getCloudEnvironment(currentSession, Appc.Cloud.AUTH_BASE, env, function (err, res) {
				should.exist(res);
				res.should.be.an.string;
				should.not.exist(err);
				done();
			});
		});

		it('should fail to get ACS_BASE environment with bad session', function (done) {
			helper.getCloudEnvironment({}, Appc.Cloud.AUTH_BASE, env, function (err, res) {
				should.not.exist(res);
				should.exist(err);
				err.should.have.property('message');
				err.message.should.containEql('session is not valid. missing user');
				done();
			});
		});

		it('should fail to get NODE_ACS environment with bad session', function (done) {
			helper.getCloudEnvironment({}, Appc.Cloud.NODE_ACS, env, function (err, res) {
				should.not.exist(res);
				should.exist(err);
				err.should.have.property('message');
				err.message.should.containEql('session is not valid. missing user');
				done();
			});
		});

		it('should fail to get AUTH_BASE environment with bad session', function (done) {
			helper.getCloudEnvironment({}, Appc.Cloud.AUTH_BASE, env, function (err, res) {
				should.not.exist(res);
				should.exist(err);
				err.should.have.property('message');
				err.message.should.containEql('session is not valid. missing user');
				done();
			});
		});

		it('should fail to get a clould environment with a missing org in the session', function (done) {
			helper.getCloudEnvironment({ user:{} }, Appc.Cloud.AUTH_BASE, env, function (err, res) {
				should.not.exist(res);
				should.exist(err);
				err.should.have.property('message');
				err.message.should.containEql('session is not valid. missing org');
				done();
			});
		});
	});

	describe('app', function () {

		var api;
		var tiApp;

		before(function (done) {
			Appc.Auth.switchLoggedInOrg(currentSession, global.$config.user.developer_org_id, function (err, res, newSession) {
				currentSession = newSession;
				should.exist(res);
				should.not.exist(err);

				Appc.App.create(currentSession, path.join(__dirname, 'tiapptest4', 'tiapp.xml'), global.$config.user.developer_org_id, function (err, res) {
					should.not.exist(err);
					should.exist(res);
					tiApp = res;
					done();
				});
			});
		});

		after(function (done) {
			Appc.App.delete(currentSession, tiApp._id, function (err) {
				should.not.exist(err);
				done();
			});
			// TODO: Delete all apis created
		});

		it('should create a named app', function (done) {
			Appc.Cloud.createNamedApp(currentSession, 'TiAppTest_' + new Date(), function (err, res) {
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		it('should fail to create a named app with invalid session', function (done) {
			Appc.Cloud.createNamedApp({}, 'TiAppTest_' + new Date(), function (err, res) {
				should.exist(err);
				should.not.exist(res);
				err.message.indexOf('session is not valid').should.not.equal(-1);
				done();
			});
		});

		it('should fail to create a named app with no name', function (done) {
			Appc.Cloud.createNamedApp(currentSession, '', function (err, res) {
				should.exist(err);
				should.not.exist(res);
				err.should.equal('Invalid parameter: name');
				done();
			});
		});

		it('should create an app', function (done) {
			Appc.Cloud.createApp(currentSession, 'TiAppTest1', global.$config.user.developer_org_id,
				tiApp.guid, function (err, res) {
					should.not.exist(err);
					should.exist(res);
					api = res[0];
					done();
				}
			);
		});

		it('should fail to create an app with invalid session', function (done) {
			Appc.Cloud.createApp({}, 'TiAppTest1', global.$config.user.developer_org_id,
				tiApp.guid, function (err, res) {
					should.exist(err);
					should.not.exist(res);
					should.exist(err.message);
					err.message.should.equal('session is not valid');
					done();
				});
		});

		it('should be able to create an app with no name', function (done) {
			Appc.Cloud.createApp(currentSession, null, global.$config.user.developer_org_id,
				tiApp.guid, function (err, res) {
					should.exist(res);
					should.not.exist(err);
					done();
				});
		});

		it('should be able to create an app with no org_id', function (done) {
			Appc.Cloud.createApp(currentSession, 'TiAppTest1', null,
				tiApp.guid, function (err, res) {
					should.exist(res);
					should.not.exist(err);
					done();
				});
		});

		it('should be able to create an app with no guid', function (done) {
			Appc.Cloud.createApp(currentSession, 'TiAppTest1', global.$config.user.developer_org_id, null, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		it('should fail to create an app with invalid org ID', function (done) {
			Appc.Cloud.createApp(currentSession, 'TiAppTest1', '123',
				tiApp.guid, function (err, res) {
					should.exist(err);
					should.not.exist(res);
					done();
				});
		});

		it('should fail to create an app with invalid guid', function (done) {
			Appc.Cloud.createApp(currentSession, 'TiAppTest1', global.$config.user.developer_org_id,
				'123', function (err, res) {
					should.exist(err);
					should.not.exist(res);
					should.exist(err.message);
					done();
				});
		});

		var apiUser;
		it('should create an Arrow DB user object', function (done) {
			should.exist(api);
			should.exist(api.guid);
			apiUser = 'test_' + Date.now();
			Appc.Cloud.createUser(currentSession, api.guid, {
				password_confirmation: 'test',
				password: 'test',
				username: apiUser

			}, function (err, res) {
				should.exist(res);
				should.not.exist(err);
				done();
			});
		});

		it('should retrieve the list of acs users for an app guid', function (done) {
			Appc.Cloud.retrieveUsers(currentSession, api.guid, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				res.username.should.equal(apiUser);
				done();
			});
		});

		it('should fail to create an Arrow DB user object with invalid api guid', function (done) {
			Appc.Cloud.createUser(currentSession, '123', {
				password_confirmation: 'test',
				password: 'test',
				username: 'test_' + Date.now()

			}, function (err, res) {
				should.exist(err);
				should.not.exist(res);
				err.message.should.containEql('could not locate a document in the apis collection for the guid:');
				done();
			});
		});

		it('should fail to create an Arrow DB user object with not enough credentials', function (done) {
			should.exist(api);
			should.exist(api.guid);
			Appc.Cloud.createUser(currentSession, api.guid, {
				password_confirmation: 'test',
				password: 'test'

			}, function (err, res) {
				should.exist(err);
				should.not.exist(res);
				err.message.should.equal('Failed to create user: Validation failed - A username, email or external account is required.');
				done();
			});
		});
	});
});
