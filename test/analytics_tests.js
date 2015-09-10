// globals $config
var should = require('should'),
	helper = require('./helper'),
	express = require('express'),
	request = require('request'),
	bodyparser = require('body-parser'),
	AppC,
	originalUrl,
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
			AppC.Analytics.url = 'http://127.0.0.1:' + server.port + '/track';
			done();
		});
	});

	afterEach(function () {
		notification = null;
	});

	after(function (done) {
		AppC.Analytics.url = originalUrl;
		if (server) {
			server.close(done);
		} else {
			done();
		}
	});

	it('should send analytics data with guid only', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', null, null, null, null, null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'appc.feature');
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
		AppC.Analytics.sendEvent('guid', 'mid', null, null, null, null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'appc.feature');
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
		AppC.Analytics.sendEvent('guid', 'mid', {a:1}, null, null, null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'appc.feature');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({a:1});
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', {a:1}, 'event', null, null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({a:1});
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', {a:1}, 'event', null, null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'production');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({a:1});
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', {a:1}, 'event', 'deploytype', null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({a:1});
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype and sid', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.sendEvent('guid', 'mid', {a:1}, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid', function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid', 'sid-sid-sid-sid-sid-sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({a:1});
			done();
		});
	});

	it('should send analytics data with guid, mid, eventdata, event, deploytype, sid and no callback', function (done) {
		should(AppC.Analytics).be.an.object;
		notification = function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).have.property('id');
			should(result[0]).have.property('sid', 'sid-sid-sid-sid-sid-sid');
			should(result[0]).have.property('mid', 'mid');
			should(result[0]).have.property('aguid', 'guid');
			should(result[0]).have.property('deploytype', 'deploytype');
			should(result[0]).have.property('ts');
			should(result[0]).have.property('event', 'event');
			should(result[0]).have.property('data');
			should(result[0]).have.property('ver', '3');
			should(Date.parse(result[0].ts)).be.a.Date;
			should(result[0].id).match(/^[\w-]{16,}$/);
			should(result[0].sid).match(/^[\w-]{16,}$/);
			should(result[0].data).be.eql({a:1});
			done();
		};
		AppC.Analytics.sendEvent('guid', 'mid', {a:1}, 'event', 'deploytype', 'sid-sid-sid-sid-sid-sid');
	});

	it('should send analytics to real url and get back result', function (done) {
		should(AppC.Analytics).be.an.object;
		AppC.Analytics.url = originalUrl;
		AppC.Analytics.sendEvent(global.$config.apps.enterprise.app_guid, null, null, null, null, null, function (err, result) {
			should(err).not.be.ok;
			should(result).be.an.array;
			should(result).have.length(1);
			should(result[0]).be.equal(204);
			done();
		});
	});

});
