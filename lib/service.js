/*jshint globalstrict: true*/ 'use strict';
var async = require('async'),
    child_process = require('child_process'),
    splunkjs = require('splunk-sdk'),
    path = require('path'),
    inquirer = require('inquirer'),
    environment = require('./environment');

var SplunkService = function(grunt) {
  var _self = this;
  var splunkHome = grunt.config('splunk.splunkHome');

  var _splunkExec = function(args, done) {
    if (splunkHome) {
      grunt.log.subhead('Splunk: executing command...');
      grunt.log.debug('Splunk: home directory is "' + splunkHome + '"');
      grunt.log.debug('Splunk: launching command "' + args.join(' ') + '"');
      var splunkCommand = path.join(splunkHome, 'bin',  environment.isWindows() ? 'splunk.exe' : 'splunk');
      grunt.log.debug('Splunk: command is "' + splunkCommand + '"');
      var splunkProc = child_process.spawn(splunkCommand, args, { stdio: 'inherit' });
      splunkProc.on('error', function(err) {
        if (environment.isWindows() && err.message.indexOf('740') >= 0) {
          grunt.fatal('Current task should be launched with elevated permissions.');
        } else {
          grunt.fatal(err.message);
        }
      })
      splunkProc.on('exit', function(code, signal) {
        grunt.log.debug('Exited with code ' + code + ' and signal ' + signal);
        grunt.log.ok('Splunk: command "' + args.join(' ') + '" is completed.');
        done();
      });
    } else {
      grunt.fatal('Splunk: cannot locate splunk home directory.\n' +
        'You can specify it with SPLUNK_HOME shell variable\n' +
        'or specify splunk.options.homeDir it Gruntfile.js\n' +
        'or simple run it under Splunk home folder.', /* errorcode: fatal */ 1);
    }
  };

  _self.restart = function(done) {
    _splunkExec(['restart'], done);
  };

  _self.restartSplunkd = function(done) {
    _splunkExec(['restart', 'splunkd'], done);
  };

  _self.restartSplunkWeb = function(done) {
    _splunkExec(['restart', 'splunkweb'], done);
  };

  _self.start = function(done) {
    _splunkExec(['start'], done);
  };

  _self.startSplunkd = function(done) {
    _splunkExec(['start', 'splunkd'], done);
  };

  _self.startSplunkWeb = function(done) {
    _splunkExec(['start', 'splunkweb'], done);
  };

  _self.stop = function(done) {
    _splunkExec(['stop'], done);
  };

  _self.stopSplunkd = function(done) {
    _splunkExec(['stop', 'splunkd'], done);
  };

  _self.stopSplunkWeb = function(done) {
    _splunkExec(['stop', 'splunkweb'], done);
  };

  _self.reloadSplunkApps = function(done) {
    grunt.config.requires('splunk.splunkd');
    async.waterfall([
      // Get splunkd config, ask for password if it is required
      function(next) {
        var splunkdConfig = grunt.config('splunk.splunkd');
        if (!splunkdConfig.password &&
          !grunt.config('splunk.storePassword')) {
          inquirer.prompt([
            {
              type: 'password',
              name: 'splunkd_password',
              message: splunkdConfig.username + ' password is required for connection to splunkd:'
            }
          ], function(answers) {
            grunt.config.set('splunk.splunkd.password', splunkdConfig.password = answers.splunkd_password);
            next(null, splunkdConfig);
          });
        } else {
          next(null, splunkdConfig);
        }
      },
      // Create connection to splunkd
      function(splunkdConfig, next) {
        grunt.log.debug('Splunk: splunkd options are\n' + JSON.stringify(splunkdConfig, null, '\t'));
        next(null, new splunkjs.Service(splunkdConfig));
      },
      // Reload apps
      function(service, next) {
        grunt.log.debug('Splunk: requesting /services/apps/local/_reload.');
        service.get('/services/apps/local/_reload', {}, function(err, response) {
          grunt.log.debug('Splunk: \n' + JSON.stringify(response, null, '\t'));
          next(err, service);
        });
      },
      // Reload nav
      function(service, next) {
        grunt.log.debug('Splunk: requesting /services/data/ui/nav/_reload.');
        service.get('/services/data/ui/nav/_reload', {}, function(err, response) {
          grunt.log.debug('Splunk: \n' + JSON.stringify(response, null, '\t'));
          next(err, service);
        });
      },
      // Reload views
      function(service, next) {
        grunt.log.debug('Splunk: requesting /services/data/ui/views/_reload.');
        service.get('/services/data/ui/views/_reload', {}, function(err, response) {
          grunt.log.debug('Splunk: \n' + JSON.stringify(response, null, '\t'));
          next(err, service);
        });
      },
      // Load messages
      function(service, next) {
        grunt.log.debug('Splunk: requesting /services/messages.');
        service.get('/services/messages', {}, function(err, response) {
          grunt.log.debug('Splunk: \n' + JSON.stringify(response, null, '\t'));
          next(null, response);
        });
      },
      // If it is required - restart splunk
      function(response, next) {
        // TODO: will be better to find better way of recognizing restart message
        if ((/restart/i).test(JSON.stringify(response.data.entry))) {
          grunt.log.debug('Splunk: requires splunkd restart');
          _self.restartSplunk(next);
        } else {
          next();
        }
      }
    ], function(err) {
      if (err) {
        grunt.log.error(JSON.stringify(err));
        grunt.warn('Splunk: cannot reload applications. Splunk is not launched or configuration is wrong.');
      } else {
        grunt.log.ok('Splunk: application configurations were successfully reloaded.');
      }
      done();
    });
  };
};

module.exports = SplunkService;