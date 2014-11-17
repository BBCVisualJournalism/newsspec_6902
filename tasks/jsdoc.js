module.exports = function (grunt) {
    grunt.config('jsdoc', {

	        dist : {
	            src: ['source/js/*.js'],
	            options: {
	                destination: 'doc'
	            }
	        }

    });
    grunt.loadNpmTasks('grunt-jsdoc');
};