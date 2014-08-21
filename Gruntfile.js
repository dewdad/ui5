// Generated on 2014-06-06 using
// generator-sapui5 0.0.1
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
    //coffee: 'coffee',
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
//      coffee: {
//        files: ['<%= yeoman.coffee %>/**/*.coffee'],
//        tasks: ['coffee:dist']
//      },
      app: {
        files: [
          '<%= yeoman.app %>/*.html',
          '<%= yeoman.app %>/style/**/*.css',
          '<%= yeoman.app %>/**/*.js'
        ]
      }
    },

//    coffee: {
//      dist: {
//        files: [{
//          expand: true,
//          flatten: false,
//          cwd: '<%= yeoman.coffee %>',
//          src: ['**/*.coffee'],
//          dest: '<%= yeoman.app %>',
//          ext: function(ext) {
//            return ext.replace(/coffee$/, 'js');
//          }
//        }]
//      }
//    },

    connect: {
      options: {
        port: SERVER_PORT,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      proxies:
        [
            /*{ // Uncomment this if you're behind a corporate proxy
                context: '/V2',
                host: 'proxy', // e.g. someproxy.com
                port: 8080, // proxy port
                headers: {
                    Host: "services.odata.org" // the real host you want to access
                },
                changeOrigin: true
            }*/
            { // Uncomment this if NOT behind a corporate proxy
              context: '/V2',
              host: "services.odata.org",
              changeOrigin: true
            }
        ],
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              require('grunt-connect-proxy/lib/utils').proxyRequest,
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
    },

    concat: {
      doc: {
        options: {
          separator: '\r\n\r\n',
          process: function(src, filepath) {
            return src.replace(/img/gi, 'docs/img');
          }
        },
        src: ['docs/**/*.md'],
        dest: 'README.md'
      }
    }

  });

  grunt.registerTask('server', function(target) {

    grunt.task.run([
      'configureProxies',
      'connect:livereload',
      'open:server',
      'watch'
    ]);
  });

  grunt.registerTask('default', [
    'server'
  ]);

};
