module.exports = function (grunt) {
    grunt.config('dox', {
			options: {
				title: 'Player Selector Documentation'
			},
			files: {
				ignore: ['source/js/lib'],
				src: ['source/js/'],
				dest: 'docs'
			}
    });
    grunt.loadNpmTasks('grunt-dox');
};