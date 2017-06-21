'use strict';

const should = require('should');

const Appc = require('../');
const helper = require('./lib/helper');

let currentSession;
let orgName;
let user = global.$config.user;

describe('Appc.Org', function () {

	before(function (done) {
		Appc.setEnvironment(global.$config.environment);

		Appc.Auth.login(user.username, user.password, function (err, session) {
			should.not.exist(err);
			should.exist(session);
			currentSession = session;
			currentSession.isValid().should.equal(true);

			Appc.Auth.switchLoggedInOrg(currentSession, global.$config.user.developer_org_id, function (err, res, newSession) {
				currentSession = newSession;
				res.org_id.toString().should.equal(global.$config.user.developer_org_id);
				done();
			});
		});
	});

	it('should return the current user org', function (done) {
		Appc.Org.getCurrent(currentSession, function (err, org) {
			should.not.exist(err);
			should.exist(org);
			helper.objectEquals(org, currentSession.user.org).should.equal(true);
			should.exist(org.org_id);
			org.org_id.toString().should.equal(global.$config.user.developer_org_id);
			should.exist(org.name);
			orgName = org.name;
			done();
		});
	});

	it('should fail to return the current user org with invalid session', function (done) {
		Appc.Org.getCurrent({}, function (err, org) {
			should.exist(err);
			should.not.exist(org);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should get org by name', function (done) {
		should.exist(orgName);
		Appc.Org.getByName(currentSession, orgName, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			should.exist(res.name);
			res.name.should.equal(orgName);
			res.org_id.toString().should.equal(global.$config.user.developer_org_id);
			done();
		});
	});

	it('should fail to get org with invalid name', function (done) {
		Appc.Org.getByName(currentSession, '', function (err, res) {
			should.exist(err);
			should.not.exist(res);
			should.exist(err.message);
			err.message.should.equal('Org not found');
			done();
		});
	});

	it('should fail to get org with invalid session', function (done) {
		Appc.Org.getByName({}, orgName, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			should.exist(err.message);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should find an org by id', function (done) {
		Appc.Org.findById(currentSession, global.$config.user.developer_org_id, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			should.exist(res.org_id);
			res.org_id.toString().should.equal(global.$config.user.developer_org_id);
			done();
		});
	});

	it('should fail to find an org by id with invalid session', function (done) {
		Appc.Org.findById({}, global.$config.user.developer_org_id, function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should fail to find an org by id with invalid org id', function (done) {
		Appc.Org.findById(currentSession, '', function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			err.message.should.equal('id is not valid');
			done();
		});
	});

	it('should get an org by id', function (done) {
		Appc.Org.getById(currentSession, global.$config.user.developer_org_id, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			should.exist(res.org_id);
			res.org_id.toString().should.equal(global.$config.user.developer_org_id);
			done();
		});
	});

	it('should fail to get an org by id with invalid session', function (done) {
		Appc.Org.getById({}, global.$config.user.developer_org_id, function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should fail to get an org by id with invalid org id', function (done) {
		Appc.Org.getById(currentSession, '', function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			err.message.should.equal('id is not valid');
			done();
		});
	});

	it('should fail to find the orgs that the user has access to with invalid session', function (done) {
		Appc.Org.find({}, function (err, res) {
			should.not.exist(res);
			should.exist(err);
			done();
		});
	});

	var regularTime,
		cachedTime;

	it('should find the orgs that the user has access to', function (done) {
		var time = new Date().getTime();
		Appc.Org.find(currentSession, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			(res.length >= 2).should.equal(true);
			regularTime = new Date().getTime() - time;
			done();
		});
	});

	it('should find the orgs that the user has access to (cached)', function (done) {
		var time = new Date().getTime();
		Appc.Org.find(currentSession, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			(res.length >= 2).should.equal(true);
			cachedTime = new Date().getTime() - time;
			done();
		});
	});

	it('cached time should be lower (or equal to) than original time for finding orgs', function () {
		(regularTime - cachedTime).should.not.be.lessThan(-1);
	});
});
