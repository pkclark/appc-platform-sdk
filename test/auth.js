'use strict';

const path = require('path');

const should = require('should');

const Appc = require('../');
const helper = require('./lib/helper');

let currentSession;
let createdSession;

describe('Appc.Auth', function () {

	describe(global.$config.env + ' environment', function () {

		this.timeout(250000);

		before(function () {
			Appc.setEnvironment(global.$config.environment);
		});

		it('fake user should not be able to log in', function (done) {
			var fakeuser = helper.fakeUser;
			Appc.Auth.login(fakeuser.username, fakeuser.password, function (err, result) {
				should.exist(err);
				should.not.exist(result);
				done();
			});
		});

		it('user should be able to log in', function (done) {
			var user = global.$config.user;
			Appc.Auth.login(user.username, user.password, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				currentSession = result;
				done();
			});
		});

		it('user should be able to log in using new method signature', function (done) {
			var user = global.$config.user;
			var params = { username: user.username, password: user.password };
			Appc.Auth.login(params, function (err, result) {
				should.not.exist(err);
				should.exist(result);
				currentSession = result;
				done();
			});
		});

		it('session should be valid', function () {
			should.exist(currentSession);
			currentSession.isValid().should.equal(true);
		});

		it.skip('should be able to request an email auth code with a valid session', function (done) {
			should.exist(currentSession);
			Appc.Auth.requestLoginCode(currentSession, false, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		it('should not be able to request an email auth code with an invalid session', function (done) {

			var invalidSession = helper.cloneSession(currentSession);
			invalidSession.invalidate();
			invalidSession.isValid().should.equal(false);

			Appc.Auth.requestLoginCode(invalidSession, false, function (err) {
				should.exist(err);
				err.should.have.property('message');
				err.message.should.equal('session is not valid');
				done();
			});
		});

		it.skip('should verify the email auth code that was requested earlier', function (done) {
			helper.getAuthCode('email', function (err, res) {
				should.not.exist(err);
				should.exist(res);

				Appc.Auth.verifyLoginCode(currentSession, res, function (err, res) {
					should.not.exist(err);
					should.exist(res);
					res.should.equal(true);
					done();
				});
			});
		});

		it.skip('should be able to request an sms auth code with a valid session', function (done) {
			should.exist(currentSession);

			Appc.Auth.requestLoginCode(currentSession, true, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		it('should not be able to request an sms auth code with an invalid session', function (done) {
			var invalidSession = helper.cloneSession(currentSession);
			invalidSession.invalidate();
			invalidSession.isValid().should.equal(false);

			Appc.Auth.requestLoginCode(invalidSession, true, function (err) {
				should.exist(err);
				err.should.have.property('message');
				err.message.should.equal('session is not valid');
				done();
			});
		});

		it.skip('should verify the sms auth code that was requested earlier', function (done) {
			helper.getAuthCode('sms', function (err, res) {
				should.not.exist(err);
				should.exist(res);

				Appc.Auth.verifyLoginCode(currentSession, res, function (err, res) {
					should.not.exist(err);
					should.exist(res);
					res.should.equal(true);
					done();
				});
			});
		});

		it.skip('should get locked out of auth code generation after multiple attempts', function (done) {
			should.exist(currentSession);

			Appc.Auth.requestLoginCode(currentSession, true, function (err, res) {
				should.not.exist(err);
				should.exist(res);

				Appc.Auth.requestLoginCode(currentSession, true, function (err, res) {
					should.not.exist(err);
					should.exist(res);

					Appc.Auth.requestLoginCode(currentSession, true, function (err, res) {
						should.not.exist(err);
						should.exist(res);

						Appc.Auth.requestLoginCode(currentSession, true, function (err, res) {
							should.exist(err);
							should.not.exist(res);

							done();
						});
					});
				});
			});
		});

		it.skip('should be able to request another auth code after valid auth code entry', function (done) {
			should.exist(currentSession);

			helper.getAuthCode('sms', function (err, res) {
				should.not.exist(err);
				should.exist(res);

				Appc.Auth.verifyLoginCode(currentSession, res, function (err, res) {
					should.not.exist(err);
					should.exist(res);
					res.should.equal(true);

					Appc.Auth.requestLoginCode(currentSession, true, function (err, res) {
						should.not.exist(err);
						should.exist(res);

						done();
					});
				});
			});
		});

		it.skip('should be able to request an email auth code with a valid session', function (done) {
			should.exist(currentSession);

			Appc.Auth.requestLoginCode(currentSession, false, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		it('should fail to verify an invalid auth code', function (done) {
			Appc.Auth.verifyLoginCode(currentSession, 123, function (err, res) {
				should.exist(err);
				should.not.exist(res);
				err.message.should.equal('Your authorization code was invalid.');
				done();
			});
		});

		it('should fail to verify an auth code with an invalid session', function (done) {
			Appc.Auth.verifyLoginCode({}, 1234, function (err, res) {
				should.exist(err);
				should.not.exist(res);
				done();
			});
		});

		it('should switch back to the original org', function (done) {
			Appc.Auth.switchLoggedInOrg(currentSession, global.$config.user.enterprise_org_id, function (err, res, newSession) {
				currentSession = newSession;
				should.not.exist(err);
				should.exist(res);
				res.org_id.toString().should.equal(global.$config.user.enterprise_org_id);
				done();
			});
		});

		it('should fail to switch to an invalid org', function (done) {
			Appc.Auth.switchLoggedInOrg(currentSession, '123', function (err, res, newSession) {
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('id is not valid');
				should.not.exist(res);
				done();
			});
		});

		it('should fail to switch to an org without a valid session', function (done) {
			Appc.Auth.switchLoggedInOrg({}, global.$config.user.enterprise_org_id, function (err, res, newSession) {
				should.not.exist(res);
				should.exist(err);
				should.exist(err.message);
				err.message.should.equal('session is not valid');
				done();
			});
		});

		it('should fail if user tries to log out with an invalid session', function (done) {
			should.exist(currentSession);
			var invalidSession = helper.cloneSession(currentSession);
			invalidSession.invalidate();
			// try an invalidate again to get more code coverage
			invalidSession.invalidate();
			invalidSession.isValid().should.equal(false);

			Appc.Auth.logout(invalidSession, function (err) {
				should.exist(err);
				err.should.have.property('message');
				err.message.should.equal('session is not valid');
				done();
			});
		});

		it('should be able to log out from valid session', function (done) {
			should.exist(currentSession);
			should(currentSession).be.ok();
			currentSession.isValid().should.equal(true);
			Appc.Auth.logout(currentSession, function (err) {
				should.not.exist(err);
				currentSession = undefined;
				should(currentSession).not.be.ok();
				done();
			});
		});

		it('should fail to create a session from invalid ID', function (done) {
			Appc.Auth.createSessionFromID('1234', function (err, session) {
				should.exist(err);
				should.not.exist(session);
				should.exist(err.message);
				err.message.should.equal('invalid session');
				done();
			});
		});

		it('should create a session from ID', function (done) {
			var username = global.$config.user.username,
				password = global.$config.user.password;
			helper.cliLogin(username, password, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				should.exist(res.id);
				Appc.Auth.createSessionFromID(res.id, function (err, session) {
					should.not.exist(err);
					should.exist(session);
					should.exist(session.id);
					session.id.should.equal(res.id);
					should.exist(session.user);
					should.exist(session.user._id);
					should.exist(session.user.email);
					session.user.email.should.equal(username);
					should.exist(session.user.user_id);
					should.exist(session.user.guid);
					should.exist(session.user.org_id);
					should.exist(session.user.org);
					should.exist(session.org);
					should.exist(session.org.packageId);
					should.exist(session.orgs);
					should.exist(session.entitlements);
					should.exist(session.entitlements.id);
					should.exist(session.entitlements.name);
					createdSession = session;
					done();
				});
			});
		});

		it('should validate the session previously created', function (done) {
			Appc.Auth.validateSession(createdSession, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		it('should get a cached session from createSessionFromID', function (done) {
			Appc.Auth.createSessionFromID(createdSession.id, function (err, res) {
				should.not.exist(err);
				should.exist(res);
				res.should.equal(createdSession);
				done();
			});
		});

		it('should invalidate a valid session', function (done) {
			createdSession.invalidate(function (err) {
				should.not.exist(err);
				Appc.Auth.validateSession(createdSession, function (err, res) {
					should.exist(err);
					should.not.exist(res);
					createdSession = null;
					done();
				});
			});
		});
	});
});
