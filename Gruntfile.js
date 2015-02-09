// Gruntfile.js
module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Mocha
		mocha: {
			all: {
				src: ['tests/testsrunner.html'],
			},
			options: {
				run: true
			}
		}
	});

	// Load grunt mocha task
	grunt.loadNpmTasks('grunt-mocha');

	grunt.registerTask('default', ['mocha']);
};
