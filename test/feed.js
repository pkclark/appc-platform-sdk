'use strict';

const should = require('should');

const Appc = require('../');
require('./lib/helper');

let currentSession;
let user = global.$config.user;

describe('Appc.Feed', function () {

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

	it('should find all the feeds for the logged in user', function (done) {
		Appc.Feed.findAll(currentSession, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			should.exist(res.meta);
			should.exist(res.meta.total);
			should(res.meta.total).be.a.Number();
			should.exist(res.data);
			Array.isArray(res.data).should.equal(true);
			if (res.data.length) {
				should.exist(res.data[0]._id);
				should.exist(res.data[0].from);
				should.exist(res.data[0].to);
				should.exist(res.data[0].templateData);
				should.exist(res.data[0].timestamp);
				should.exist(res.data[0].friendlytime);
				should.exist(res.data[0].formattedtime);
				done();
			} else {
				done();
			}
		});
	});

	it('should find all the feeds with limit', function (done) {
		Appc.Feed.findAll(currentSession, { limit: 2 }, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			should.exist(res.meta);
			should.exist(res.meta.total);
			should(res.meta.total).be.a.Number();
			should.exist(res.data);
			Array.isArray(res.data).should.equal(true);
			if (res.data.length) {
				res.length.should.not.be.greaterThan(2);
				should.exist(res.data[0]._id);
				should.exist(res.data[0].from);
				should.exist(res.data[0].to);
				should.exist(res.data[0].templateData);
				should.exist(res.data[0].timestamp);
				should.exist(res.data[0].friendlytime);
				should.exist(res.data[0].formattedtime);
				done();
			} else {
				done();
			}
		});
	});

	it('should fail to find all the feeds for an invalid session', function (done) {
		Appc.Feed.findAll({}, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('session is not valid');
			done();
		});
	});
});
