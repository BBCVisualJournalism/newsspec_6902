module.exports = function (grunt) {

    // *************************************************************************
    // REQUIRE PATHS
    // Add any paths here you want shortened. Relative to the 'js' dir.
    // *************************************************************************

    var amdModulePaths = {
        'pubsub': './lib/vendors/jquery/pubsub',
        'istats': './lib/vendors/istats/istats',
        'data/players': 'empty:',
        'vocabs/team_vis_vocab': 'empty:',
        'vocabs/core': 'empty:',
        'data/pundits': 'empty:'
    };

    // *************************************************************************
    // GRUNT CONFIG
    // You shouldn't need to edit anything below here
    // *************************************************************************

    var _ = require('lodash-node');

    var requirePathsForJquery1build = _.merge({
            'jquery': './lib/vendors/jquery/jquery-1.11.1'
        }, amdModulePaths);

    var requirePathsForJquery2build = _.merge({
            'jquery': './lib/vendors/jquery/jquery-2.1.1'
        }, amdModulePaths);

    grunt.config(['amdModulePaths'], amdModulePaths);

    grunt.config(['requirejs', 'jquery1'], {
        options: {
            baseUrl: './source/js',
            paths: requirePathsForJquery1build,
            optimize: 'uglify2',
            generateSourceMaps: false,
            preserveLicenseComments: false,
            name: './app',
            out: './content/<%= pkg.services.default %>/js/all-legacyie.js'
        }
    });
    grunt.config(['requirejs', 'jquery2'], {
        options: {
            baseUrl: './source/js',
            paths: requirePathsForJquery2build,
            optimize: 'uglify2',
            generateSourceMaps: false,
            preserveLicenseComments: false,
            name: './app',
            out: './content/<%= pkg.services.default %>/js/all-html5.js'
        }
    });
    grunt.loadNpmTasks('grunt-contrib-requirejs');
};