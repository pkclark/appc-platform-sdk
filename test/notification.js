'use strict';

const should = require('should');

const Appc = require('../');
const helper = require('./lib/helper');

let currentSession;
let user = global.$config.user;

describe('Appc.Notification', function () {

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

	it('should find all the notifications for the logged in user', function (done) {
		Appc.Notification.findAll(currentSession, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			Object.prototype.toString.call(res).should.equal('[object Array]');
			if (res.length) {
				should.exist(res[0]._id);
				should.exist(res[0].feed_id);
				should.exist(res[0].user_guid);
				should.exist(res[0].message);
				should.exist(res[0].created);
				done();
			} else {
				done();
			}
		});
	});

	it('should fail to find all the notifications for an invalid session', function (done) {
		Appc.Notification.findAll({}, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('session is not valid');
			done();
		});
	});
});
