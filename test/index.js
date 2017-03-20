'use strict';

const should = require('should');

const Appc = require('../');
const pkg = require('../package.json');

describe('Appc properties', function () {

	it('Appc required successfully', function () {
		Appc.should.be.an.object;
	});

	it('version refs package version', function () {
		Appc.version.should.equal(pkg.version);
	});

	it('userAgent refs package version', function () {
		Appc.userAgent.should.startWith(`Appcelerator/${pkg.version}`);
	});
});
