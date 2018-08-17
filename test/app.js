'use strict';

const path = require('path');

const should = require('should');

const Appc = require('../');
require('./lib/helper');

let currentSession;
let user = global.$config.user;

describe('Appc.App', function () {

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

	it('should get all the apps in the current org that the user has access to', function (done) {
		Appc.Auth.switchLoggedInOrg(currentSession, global.$config.user.enterprise_org_id, function (err, res, newSession) {
			currentSession = newSession;
			should.not.exist(err);
			should.exist(newSession);

			Appc.App.findAll(currentSession, function (err, apps) {
				should.not.exist(err);
				should.exist(apps);
				apps.length.should.not.be.below(global.$config.apps.numberOfApps);
				done();
			});
		});
	});

	it('should get all the apps in a specific org', function (done) {
		Appc.App.findAll(currentSession, global.$config.user.enterprise_org_id, function (err, apps) {
			should.not.exist(err);
			should.exist(apps);
			apps.length.should.not.be.below(global.$config.apps.numberOfApps);
			done();
		});
	});

	it('should fail to find apps in an org that the user does not have access to', function (done) {
		Appc.App.findAll(currentSession, 123, function (err, apps) {
			should.exist(err);
			err.code.should.equal(403);
			err.message.should.equal('You do not have access privileges to view this content.');
			should.not.exist(apps);
			done();
		});
	});

	it('should fail to find apps with an invalid session', function (done) {
		Appc.App.findAll({}, 123, function (err) {
			should.exist(err);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should find a specific app by ID', function (done) {
		Appc.App.find(currentSession, global.$config.apps.enterprise.app_id, function (err, app) {
			should.not.exist(err);
			should.exist(app);
			app.app_name.should.equal(global.$config.apps.enterprise.app_name);
			done();
		});
	});

	it('should fail to find an invalid app by ID', function (done) {
		Appc.App.find(currentSession, 1, function (err, app) {
			should.exist(err);
			should.not.exist(app);
			done();
		});
	});

	it('should fail to a valid app with an invalid session', function (done) {
		Appc.App.find({}, global.$config.apps.enterprise.app_id, function (err) {
			should.exist(err);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should update an app and revert it to the original state', function (done) {
		Appc.App.find(currentSession, global.$config.apps.enterprise.app_id, function (err, app) {
			let originalName = global.$config.apps.enterprise.app_name;
			let newName = global.$config.apps.enterprise.app_name + '_modified';
			should.not.exist(err);
			should.exist(app);
			app.app_name.should.equal(originalName);
			app.app_name = newName;

			Appc.App.update(currentSession, app, function (err) {
				should.not.exist(err);

				Appc.App.find(currentSession, global.$config.apps.enterprise.app_id, function (err, updatedApp) {
					should.not.exist(err);
					should.exist(app);
					updatedApp.app_name.should.equal(newName);
					updatedApp.app_name = originalName;

					Appc.App.update(currentSession, updatedApp, function (err) {
						should.not.exist(err);

						Appc.App.find(currentSession, global.$config.apps.enterprise.app_id, function (err, revertedApp) {
							should.not.exist(err);
							should.exist(revertedApp);
							revertedApp.app_name.should.equal(originalName);
							done();
						});
					});

				});
			});
		});
	});

	it('should fail to update an app which does not exist', function (done) {
		var newApp = {
			app_id: 123,
			app_name: 'this_should_fail_app',
			app_guid: 1234567890
		};
		Appc.App.find(currentSession, newApp, function (err, app) {
			should.exist(err);
			should.not.exist(app);

			Appc.App.update(currentSession, newApp, function (err) {
				should.exist(err);
				done();
			});
		});
	});

	it('should fail to update an app with an invalid session', function (done) {
		Appc.App.find(currentSession, global.$config.apps.enterprise.app_id, function (err, app) {
			should.not.exist(err);
			should.exist(app);

			Appc.App.update({}, app, function (err) {
				should.exist(err);
				err.message.should.equal('session is not valid');
				done();
			});
		});
	});

	it('should fail to update an invalid app', function (done) {
		Appc.App.update(currentSession, {}, function (err) {
			should.exist(err);
			err.message.should.equal('no app_guid property found');
			done();
		});
	});

	it('should fail to create an app from non-existent tiapp.xml', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest0', 'none.xml'), global.$config.user.enterprise_org_id, function (err, app) {
			should.exist(err);
			err.message.should.equal('tiapp.xml file does not exist');
			should.not.exist(app);
			done();
		});
	});

	it('should create an app from provided tiapp.xml', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest1', 'tiapp.xml'), global.$config.user.enterprise_org_id, function (err, app) {
			should.not.exist(err);
			should.exist(app);

			Appc.App.delete(currentSession, app._id, function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	it('should create an app from provided tiapp.xml with no org id', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest1', 'tiapp.xml'), function (err, app) {
			should.not.exist(err);
			should.exist(app);

			Appc.App.delete(currentSession, app._id, function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	it('should fail create an app from provided tiapp.xml with no org id and invalid session', function (done) {
		Appc.App.create({}, path.join(__dirname, 'tiapptest1', 'tiapp.xml'), function (err, app) {
			should.exist(err);
			err.message.should.equal('session is not valid');
			should.not.exist(app);
			done();
		});
	});

	it('should create an app from provided tiapp.xml with a null org id', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest1', 'tiapp.xml'), null, function (err, app) {
			should.not.exist(err);
			should.exist(app);

			Appc.App.delete(currentSession, app._id, function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	it('should update an app from provided tiapp.xml', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest2', 'tiapp.xml'), global.$config.user.enterprise_org_id, function (err, app) {
			should.not.exist(err);
			should.exist(app);

			Appc.App.find(currentSession, app._id, function (err, app) {
				should.not.exist(err);
				should.exist(app);
				app.app_name.should.equal('TiAppTest2_changeme');

				Appc.App.create(currentSession, path.join(__dirname, 'tiapptest2', 'tiapp_changed.xml'), global.$config.user.enterprise_org_id, function (err, app2) {
					should.not.exist(err);
					should.exist(app2);

					Appc.App.find(currentSession, app2._id, function (err, changedApp) {
						should.not.exist(err);
						should.exist(changedApp);
						changedApp.app_name.should.equal('TiAppTest2');

						Appc.App.delete(currentSession, changedApp._id, function (err) {
							should.not.exist(err);
							done();
						});
					});
				});
			});
		});
	});

	it('should fail to create an app from invalid tiapp.xml', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest3', 'tiapp.xml'), global.$config.user.enterprise_org_id, function (err, app) {
			should.exist(err);
			err.code.should.equal(500);
			should.not.exist(app);
			done();
		});
	});

	it('should fail to create an app from invalid session', function (done) {
		Appc.App.create({}, path.join(__dirname, 'tiapptest1', 'tiapp.xml'), global.$config.user.enterprise_org_id, function (err, app) {
			should.exist(err);
			err.message.should.equal('session is not valid');
			should.not.exist(app);
			done();
		});
	});

	it('should fail to create a tiapp.xml app with invalid org id', function (done) {
		Appc.App.create(currentSession, path.join(__dirname, 'tiapptest1', 'tiapp.xml'), 123, function (err, app) {
			should.exist(err);
			err.code.should.equal(404);
			should.not.exist(app);
			done();
		});
	});

	it('should find an enterprise package by application guid and session', function (done) {
		Appc.App.findPackage(currentSession, global.$config.apps.enterprise.app_guid, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.package.should.equal('enterprise');
			res.isPlatform.should.equal(true);
			done();
		});
	});

	it('should find an enterprise package by application guid and token', function (done) {
		Appc.App.findPackage(currentSession, global.$config.apps.enterprise.app_guid, global.$config.auth_token, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.package.should.equal('enterprise');
			res.isPlatform.should.equal(true);
			done();
		});
	});

	it('should fail to find an enterprise package by application guid and invalid session', function (done) {
		Appc.App.findPackage({}, global.$config.apps.enterprise.app_guid, function (err, res) {
			should.exist(err);
			should.not.exist(res);
			err.message.should.equal('session is not valid');
			done();
		});
	});

	it('should fail to find an application package by invalid application guid and session', function (done) {
		Appc.App.findPackage(currentSession, '123', function (err, res) {
			should.exist(err);
			should.exist(err.code);
			err.code.should.be.greaterThan(400);
			should.not.exist(res);
			done();
		});
	});

	// skipped due to platform state being incorrectly configured
	it('should find a free application package by application guid and session', function (done) {
		Appc.App.findPackage(currentSession, global.$config.apps.developer.app_guid, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.isPlatform.should.equal(false);
			res.package.should.equal('free');
			done();
		});
	});

	it('should find the team members of an app', function (done) {
		Appc.App.findTeamMembers(currentSession, global.$config.apps.enterprise.app_id, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			should.exist(res.members);
			res.members.length.should.equal(1);
			res.members[0].guid.should.equal(currentSession.user.guid);
			done();
		});
	});

	it('should fail to find the team members of an invalid app', function (done) {
		Appc.App.findTeamMembers(currentSession, '123', function (err, res) {
			should.exist(err);
			err.message.should.equal('Resource Not Found');
			err.code.should.equal(404);
			should.not.exist(res);
			done();
		});
	});

	it('should fail to find the team members of an app with an invalid session', function (done) {
		Appc.App.findTeamMembers({}, global.$config.apps.enterprise.app_id, function (err, res) {
			should.exist(err);
			err.message.should.equal('session is not valid');
			should.not.exist(res);
			done();
		});
	});

	it('should get the crittercism ID of an enterprise app', function (done) {
		Appc.App.crittercismID(currentSession, global.$config.apps.enterprise.app_id, function (err, id) {
			should.not.exist(err);
			should.exist(id);
			done();
		});
	});

	it('should fail to get the crittercism ID of an enterprise app with invalid session', function (done) {
		Appc.App.crittercismID({}, global.$config.apps.enterprise.app_id, function (err, id) {
			should.exist(err);
			should.not.exist(id);
			done();
		});
	});
});
