'use strict';

const should = require('should');

const Appc = require('../');
require('./lib/helper');

let currentSession;
let user = global.$config.user;

describe('Appc.Event', function () {

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

	it('should fail to send an event without a session', function (done) {

		Appc.Event.send({}, 'unit.test.without.session', { test: 'unit test without session' }, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('invalid session');
			done();
		});
	});

	it('should fail to send an event without a session without callback', function (done) {

		let result = Appc.Event.send({}, 'unit.test.without.session.without.callback', { test: 'unit test without session without callback' });
		result.message.should.equal('invalid session');
		done();
	});

	it('should fail to send an event with an invalid session', function (done) {
		let invalidSession = Object.assign({}, currentSession);
		delete invalidSession.id;

		Appc.Event.send(invalidSession, 'unit.test.with.invalid.session', { test: 'unit test with invalid session' }, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('invalid session');
			done();
		});
	});

	it('should fail to send an event with an invalid session without callback', function (done) {
		let invalidSession = Object.assign({}, currentSession);
		delete invalidSession.id;

		let result = Appc.Event.send(invalidSession, 'unit.test.with.invalid.session.without.callback', { test: 'unit test with invalid session without callback' });
		result.message.should.equal('invalid session');
		done();
	});

	it('should fail to send an event without a name', function (done) {

		Appc.Event.send(currentSession, {}, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('invalid event name');
			done();
		});
	});

	it('should fail to send an event without a name without callback', function (done) {

		let result = Appc.Event.send(currentSession, { test: 'unit test with invalid session without callback' });
		result.message.should.equal('invalid event name');
		done();
	});

	it('should fail to send an event with blank name', function (done) {

		Appc.Event.send(currentSession, '', { test: 'unit test with blank name' }, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('invalid event name');
			done();
		});
	});

	it('should fail to send an event with blank name without callback', function (done) {

		let result = Appc.Event.send(currentSession, '', { test: 'unit test with blank name without callback' });
		result.message.should.equal('invalid event name');
		done();
	});

	it('should fail to send an event with data as non-object', function (done) {

		Appc.Event.send(currentSession, 'unit.test.fail', 'unit.test.fail', function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('invalid event data');
			done();
		});
	});

	it('should fail to send an event with data as non-object without callback', function (done) {

		let result = Appc.Event.send(currentSession, 'unit.test.fail.without.callback', 'unit.test.fail.without.callback');
		result.message.should.equal('invalid event data');
		done();
	});

	it('should send an event without data', function (done) {

		Appc.Event.send(currentSession, 'unit.test.without.data', function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.success.should.be.true();
			done();
		});
	});

	it('should send an event without data without callback', function (done) {

		Appc.Event.send(currentSession, 'unit.test.without.data.without.callback')
			.on('error', done)
			.on('response', function (resp) {
				should.exist(resp);
				done();
			});
	});

	it('should send an event with blank data', function (done) {

		Appc.Event.send(currentSession, 'unit.test.with.blank.data', {}, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.success.should.be.true();
			done();
		});
	});

	it('should send an event with blank data without callback', function (done) {

		Appc.Event.send(currentSession, 'unit.test.with.blank.data.without.callback', {})
			.on('error', done)
			.on('response', function (resp) {
				should.exist(resp);
				done();
			});
	});

	it('should send an event', function (done) {

		Appc.Event.send(currentSession, 'unit.test.with.data', { test: 'unit test with data' }, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.success.should.be.true();
			done();
		});
	});

	it('should send an event without callback', function (done) {

		Appc.Event.send(currentSession, 'unit.test.with.data.without.callback', { test: 'unit test with data without callback' })
			.on('error', done)
			.on('response', function (resp) {
				should.exist(resp);
				done();
			});
	});
});
