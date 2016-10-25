module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            dev: {
                options: {
                    mangle: false,
                    preserveComments: true,
                    beautify: true
                },
                files: {
                    '../js/min/app.js' : ['../js/libs/jquery.min.js', '../js/libs/angular.js', '../js/libs/angular.rzslider.js', '../js/mousetrap.js', '../js/app.js'],
                    '../js/min/popup.js' : ['../js/popup.js']
                }
            },
            dist: {
                options: {
                    mangle: true,
                    preserveComments: false,
                    beautify: false
                },
                files: {
                    '../js/min/app.js' : ['../js/libs/jquery.min.js', '../js/libs/angular.js', '../js/libs/angular.rzslider.js', '../js/mousetrap.js', '../js/app.js'],
                    '../js/min/popup.js' : ['../js/popup.js']
                }
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: '../scss/',
                    cssDir: '../css/',
                    environment: 'production'
                }
            },
            dev: {
                options: {
                    sassDir: '../scss/',
                    cssDir: '../css/',
                    outputStyle: 'expanded'
                }
            }
        },

        watch: {
            scss: {
                files: ['../scss/*.scss'],
                tasks: ['compass:dev'],
                options: {
                    spawn: false
                }
            },
            js: {
                files: ['../js/*.js'],
                tasks: ['uglify:dev'],
                options: {
                    spawn: false
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch:js']);
}