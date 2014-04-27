// Generated on 2014-04-26 using generator-sapui5 0.0.1
'use strict';

var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: 'app'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    yeoman: yeomanConfig,
    watch: {
      options: {
        nospawn: true,
        livereload: true
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/**/*.html',
          '<%= yeoman.app %>/css/**/*.css',
          '<%= yeoman.app %>/**/*.js'
        ]
      }
    },

    connect: {
      options: {
        port: SERVER_PORT,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              lrSnippet,
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:' + SERVER_PORT
      }
    }

  });

  grunt.registerTask('server', function(target) {

    grunt.task.run([
      'connect:livereload',
      'open:server',
      'watch'
    ]);
  });

  grunt.registerTask('default', [
    'server'
  ]);
  
};