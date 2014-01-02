/*jshint globalstrict: true*/ 'use strict';

var SplunkService = require('./../lib/service');

module.exports = function(grunt) {
  grunt.config.requires('splunk.splunkHome');

  grunt.registerTask('splunk-services', 'Manipulate Splunk services', function() {
    var done = this.async();

    var service = new SplunkService(grunt);

    if (arguments.length === 1 && arguments[0] === 'reload-apps') { // splunk-services:reload-apps
      service.reloadSplunkApps(done);
    } else {
      if (arguments.length !== 2) {
        grunt.fatal('Unexpected number of arguments. After apps you can specify only application name.');
      }

      switch (arguments[0]) {
        case '*': {
          switch (arguments[1]) {
            case 'start': { // splunk-services:*:start
              service.start(done);
              break;
            }
            case 'stop': { // splunk-services:*:stop
              service.stop(done);
              break;
            }
            case 'restart': { // splunk-services:*:restart
              service.restart(done);
              break;
            }
            default: {
              grunt.fatal('Unexpected argument: ' + arguments[1]);
              done();
              break;
            }
          }
          break;
        }
        case 'splunkd': {
          switch (arguments[1]) {
            case 'start': { // splunk-services:splunkd:start
              service.startSplunkd(done);
              break;
            }
            case 'stop': { // splunk-services:splunkd:stop
              service.stopSplunkd(done);
              break;
            }
            case 'restart': { // splunk-services:splunkd:restart
              service.restartSplunkd(done);
              break;
            }
            default: {
              grunt.fatal('Unexpected argument: ' + arguments[1]);
              done();
              break;
            }
          }
          break;
        }
        case 'splunkweb': {
          switch (arguments[1]) {
            case 'start': { // splunk-services:splunkweb:start
              service.startSplunkWeb(done);
              break;
            }
            case 'stop': { // splunk-services:splunkweb:stop
              service.stopSplunkWeb(done);
              break;
            }
            case 'restart': { // splunk-services:splunkweb:restart
              service.restartSplunkWeb(done);
              break;
            }
            default: {
              grunt.fatal('Unexpected argument: ' + arguments[1]);
              done();
              break;
            }
          }
          break;
        }
        default: {
          grunt.fatal('Unexpected argument: ' + arguments[0]);
          done();
          break;
        }
      }
    }
  });
};