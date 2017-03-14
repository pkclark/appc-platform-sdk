'use strict';

/* eslint-disable no-unused-expression ignore */

const fs = require('fs');

const bodyparser = require('body-parser');
const express = require('express');
const request = require('request');
const should = require('should');
const wrench = require('wrench');

const helper = require('./lib/helper');

let AppC,
	originalUrl,
	originalInterval,
	server,
	notification,
	app;

// jscs:disable jsDoc
describe('analytics', function () {
	this.timeout(5000);

	before(function (done) {
		AppC = require('../');
		app = express();
		app.use(bodyparser.json());
		app.post('/track', function (req, resp, next) {
			resp.json(req.body);
			notification && notification(null, req.body);
		});
		server = app.listen(0, function () {
			server.port = server.address().port;
			originalUrl = AppC.Analytics.url;
			originalInterval = AppC.Analytics.flushInterval;
			AppC.Analytics.url = 'http://127.0.0.1:' + server.port + '/track';
			done();
		});
		fs.existsSync(AppC.Analytics.analyticsDir) && wrench.rmdirSyncRecursive(AppC.Analytics.analyticsDir);
	});

	after(function (done) {
		AppC.Analytics.url = originalUrl;
		AppC.Analytics.flushInterval = originalInterval;
		fs.existsSync(AppC.Analytics.analyticsDir) && wrench.rmdirSyncRecursive(AppC.Analytics.analyticsDir);
		if (server) {
			server.close(done);
		} else {
			done();
		}
	});

	afterEach(function () {
		AppC.Analytics.stopSendingEvents();
		AppC.Analytics.url = 'http://127.0.0.1:' + server.port + '/track';
		notification = null;
		fs.existsSync(AppC.Analytics.analyticsDir) && wrench.rmdirSyncRecursive(AppC.Analytics.analyticsDir);
	});

	it('should send analytics data with guid only', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', function (err, result, sent) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(sent).be.true;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'app.feature');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({});
			done();
		});
	});

	it('should send analytics data with guid and mid only', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'app.feature');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({});
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'app.feature');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', 'deploytype', function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype and sid', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid', function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid', 'sid-sid-sid-sid-sid-sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype, sid and no callback', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.flushInterval = 1000;
		notification = function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid', 'sid-sid-sid-sid-sid-sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		};
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid');
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype, sid, platform and no callback', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.flushInterval = 1000;
		notification = function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid', 'sid-sid-sid-sid-sid-sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', 'platform');
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		};
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid', 'platform');
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype, sid, os and immediate', function (done) {
		should(AppC.Analytics).be.an.object;
		notification = function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid', 'sid-sid-sid-sid-sid-sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('platform', 'platform');
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({ a:1 });
			done();
		};
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid', 'platform', true);
	});

	it('should send analytics to real url and get back result', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.url = originalUrl;
		AppC.Analytics.sendEvent(global.$config.apps.enterprise.app_guid, function (err, result, sent) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid');
			should(result[0]).have.property('aguid', global.$config.apps.enterprise.app_guid);
			should(result[0]).have.property('platform', AppC.userAgent);
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'app.feature');
			should(result[0]).have.property('data', {});
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(sent).be.true;
			done();
		});
	});

	it('should send analytics after queuing', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.flushInterval = 10;
		notification = function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(4);
			should(result[0].data).be.eql({ a:1 });
			should(result[1].data).be.eql({ a:2 });
			should(result[2].data).be.eql({ a:3 });
			should(result[3].data).be.eql({ a:4 });
			done();
		};
		AppC.Analytics.sendEvent('guid', 'mid', { a:1 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid');
		AppC.Analytics.sendEvent('guid', 'mid', { a:2 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid');
		AppC.Analytics.sendEvent('guid', 'mid', { a:3 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid');
		AppC.Analytics.sendEvent('guid', 'mid', { a:4 }, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid');
	});

	it('should send session start and end', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.flushInterval = 10;
		var session;
		notification = function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(3);
			should(result[0]).have.property('event', 'ti.start');
			should(result[1]).have.property('event', 'app.feature');
			should(result[2]).have.property('event', 'ti.end');
			should(result[0]).have.property('sid', session.sid);
			should(result[1]).have.property('sid', session.sid);
			should(result[2]).have.property('sid', session.sid);
			done();
		};
		session = AppC.Analytics.createSession('guid');
		should(session).be.an.object;
		should(session.end).be.a.function;
		session.send({ a:1 });
		session.end();
	});

});
