'use strict';

const should = require('should');

const Appc = require('../');
const helper = require('./lib/helper');

let currentSession;
let orgName;
let user = global.$config.user;
let regularTime;
let cachedTime;

describe('Appc.Org', function () {

	before(function (done) {
		Appc.setEnvironment(global.$config.environment);

		Appc.Auth.login(user.username, user.password, function (err, session) {
			should.not.exist(err);
			should.exist(session);
			currentSession = session;
			should(currentSession.isValid()).equal(true);

			Appc.Auth.switchLoggedInOrg(currentSession, global.$config.user.developer_org_id, function (err, res, newSession) {
				currentSession = newSession;
				should(res.org_id.toString()).equal(global.$config.user.developer_org_id);
				done();
			});
		});
	});

	it('should return the current user org', function (done) {
		Appc.Org.getCurrent(currentSession, function (err, org) {
			should.not.exist(err);
			should.exist(org);
			should(helper.objectEquals(org, currentSession.user.org)).equal(true);
			should.exist(org.org_id);
			should(org.org_id.toString()).equal(global.$config.user.developer_org_id);
			should.exist(org.name);
			orgName = org.name;
			done();
		});
	});

	it('should fail to return the current user org with invalid session', function (done) {
		Appc.Org.getCurrent({}, function (err, org) {
			should.exist(err);
			should.not.exist(org);
			should(err.message).equal('session is not valid');
			done();
		});
	});

	it('should get org by name', function (done) {
		should.exist(orgName);
		Appc.Org.getByName(currentSession, orgName, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			should.exist(res.name);
			should(res.name).equal(orgName);
			should(res.org_id.toString()).equal(global.$config.user.developer_org_id);
			done();
		});
	});

	it('should fail to get org with invalid name', function (done) {
		Appc.Org.getByName(currentSession, '', function (err, res) {
			should.exist(err);
			should.not.exist(res);
			should.exist(err.message);
			should(err.message).equal('Org not found');
			done();
		});
	});

	it('should fail to get org with invalid session', function (done) {
		Appc.Org.getByName({}, orgName, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			should.exist(err.message);
			should(err.message).equal('session is not valid');
			done();
		});
	});

	it('should find an org by id', function (done) {
		Appc.Org.findById(currentSession, global.$config.user.developer_org_id, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			should.exist(res.org_id);
			should(res.org_id.toString()).equal(global.$config.user.developer_org_id);
			done();
		});
	});

	it('should fail to find an org by id with invalid session', function (done) {
		Appc.Org.findById({}, global.$config.user.developer_org_id, function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			should(err.message).equal('session is not valid');
			done();
		});
	});

	it('should fail to find an org by id with invalid org id', function (done) {
		Appc.Org.findById(currentSession, '', function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			should(err.message).equal('id is not valid');
			done();
		});
	});

	it('should get an org by id', function (done) {
		Appc.Org.getById(currentSession, global.$config.user.developer_org_id, function (err, res) {
			should.exist(res);
			should.not.exist(err);
			should.exist(res.org_id);
			should(res.org_id.toString()).equal(global.$config.user.developer_org_id);
			done();
		});
	});

	it('should fail to get an org by id with invalid session', function (done) {
		Appc.Org.getById({}, global.$config.user.developer_org_id, function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			should(err.message).equal('session is not valid');
			done();
		});
	});

	it('should fail to get an org by id with invalid org id', function (done) {
		Appc.Org.getById(currentSession, '', function (err, res) {
			should.not.exist(res);
			should.exist(err);
			should.exist(err.message);
			should(err.message).equal('id is not valid');
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

	it('should find the orgs that the user has access to', function (done) {
		var time = new Date().getTime();
		Appc.Org.find(currentSession, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			should((res.length >= 2)).equal(true);
			regularTime = new Date().getTime() - time;
			done();
		});
	});

	it('should find the orgs that the user has access to (cached)', function (done) {
		var time = new Date().getTime();
		Appc.Org.find(currentSession, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			should((res.length >= 2)).equal(true);
			cachedTime = new Date().getTime() - time;
			done();
		});
	});

	it('cached time should be lower (or equal to) than original time for finding orgs', function () {
		should((regularTime - cachedTime)).not.be.lessThan(-1);
	});
});
