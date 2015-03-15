module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.task.registerTask('default', ['coffee', 'jade', 'less']);

  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: './dist',
          layout: 'byType',
          install: true,
          verbose: true,
          cleanTargetDir: true,
          cleanBowerDir: false,
          bowerOptions: {}
        }
      }
    },
    coffee: {
      compile: {
        options: {
          bare: true
        },
        expand: true,
        flatten: true,
        cwd: 'src/',
        src: ['*.coffee'],
        dest: 'dist/js/',
        ext: '.js'
      }
    },
    jade: {
      compile: {
        options: {
          pretty: true,
          data: {
            base: '/filerepo/dmx/table-viewer/dist',
            debug: false
          }
        },
        files: {
          'index.html': 'src/index.jade'
        }
      }
    },
    less: {
      compile: {
        files: {
          'dist/css/index.css': 'src/index.less'
        }
      }
    },
    watch: {
      coffee: {
        files: ['src/*.coffee'],
        tasks: ['coffee']
      },
      jade: {
        files: ['src/*.jade'],
        tasks: ['jade']
      },
      less: {
        files: ['src/*.less'],
        tasks: ['less']
      }
    }
  });
};
