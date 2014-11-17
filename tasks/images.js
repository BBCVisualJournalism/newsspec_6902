module.exports = function (grunt) {
    grunt.config(['copy', 'standardImages'], {
        files: [{
            expand: true,
            cwd: 'source/img',
            src: '*.*',
            dest: 'content/<%= pkg.services.default %>/img'
        },
        {
            expand: true,
            src: ['**/**.{jpg,gif,png}'],
            cwd: 'source/img/responsive',
            dest: 'content/<%= pkg.services.default %>/img'
		}]
    });

    grunt.config('responsive_images', {
        main: {
            options: {
            	cache: false,
                sizes: [{
                    width: 118
                }, {
                    width: 60
                }]
            },
            files: [{
                expand: true,
                src: ['**/**.{jpg,gif,png}'],
                cwd: 'source/img/responsive',
                custom_dest: 'content/<%= pkg.services.default %>/img/{%= width %}/'
            }]
        }
    });

    grunt.config('imagemin', {
        dist: {
            options: {
                optimizationLevel: 7,
                progressive: true,
                cache: false
            },
            files: [
                {
                    expand: true,
                    src: ['content/<%= pkg.services.default %>/img/**/*.*', '<%= pkg.services.default %>/css/f/**.*'],
                    dest: './'
                }
            ]
        }
    });

	grunt.registerTask('images', [], function () {
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-imagemin');
        grunt.loadNpmTasks('grunt-responsive-images');
        grunt.task.run('copy:standardImages'/*, 'responsive_images'*/);
    });
};