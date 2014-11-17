module.exports = function (grunt) {
    grunt.config(['convert'], {
		options: {
			explicitArray: false,
		},
		csv2json: {
			expand: true,
			cwd: 'source/data/',
			src: ['**/*.csv'],
			dest: 'source/data/',
			ext: '.json'
		}
    });
    grunt.config(['assemble'], {
		options: {
			flatten: true,
			data: ['source/data/players_index_raw.json'],
			helpers: ['source/tmpl/handlebars/helpers.js'],
			ext: '.js'
		},
		tables: {
			files: {
				'source/js/data/players_index.js': ['source/tmpl/handlebars/**/*.hbs']
			}
		}
    });
    grunt.loadNpmTasks('grunt-convert');
    grunt.loadNpmTasks('assemble');
    grunt.registerTask('compile', ['convert', 'assemble']);
};
