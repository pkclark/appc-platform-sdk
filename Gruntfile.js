process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		eslint: {
			target: [ 'index.js', 'lib/**/*.js', 'test/**/*.js' ],
			options: {
				quiet: true
			}
		},
		mochaTest: {
			src: [ 'test/*.js' ],
			options: {
				timeout: 40000,
				reporter: 'spec',
				bail: true,
				ignoreLeaks: false,
				globals: []
			}
		},
		kahvesi: {
			src: [ 'index.js', 'lib/**/*.js', 'test/**/*.js' ]
		},
		appcCoverage: {
			default_options: {
				src: 'coverage/lcov.info',
				force: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-kahvesi');
	grunt.loadNpmTasks('grunt-appc-coverage');

	grunt.registerTask('cover', [ 'kahvesi', 'appcCoverage' ]);
	grunt.registerTask('default', [ 'eslint', 'mochaTest' ]);
};
