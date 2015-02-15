'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        karma: {
            unit: {
                options: {
                    files: [
                        'components/angular/angular.js',
                        'components/angular-mocks/angular-mocks.js',
                        'components/chai/chai.js',
                        'ngStorage.js',
                        'test/spec.js'
                    ]
                },

                frameworks: ['mocha'],

                browsers: [
                    'Chrome',
                    'PhantomJS',
                    'Firefox'
                ],

                singleRun: true
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> | Copyright (c) <%= grunt.template.today("yyyy") %> Gias Kay Lee | MIT License */'
            },

            build: {
                src: 'ngStorage.js',
                dest: 'ngStorage.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('test', ['karma']);

    grunt.registerTask('default', [
        'test',
        'uglify'
    ]);
};
