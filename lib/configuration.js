/*jshint globalstrict: true*/ 'use strict';

var _ = require('underscore'),
    async = require('async'),
    configStorage = require('./configStorage'),
    inquirer = require('inquirer');

module.exports = {
  /*
   * Execute configuration task
   */
  configure: function(done) {
    var config = configStorage.get();
    var configSplunkd = config.splunkd;

    inquirer.prompt([
      {
        name: 'splunkd_username',
        message: 'Splunkd username',
        default: configSplunkd.username
      }, {
        type: 'confirm',
        name: 'storePassword',
        message: 'Do you want to store password? (will be stored in base64 text under user home folder):',
        default: config.storePassword
      }, {
        type: 'password',
        name: 'splunkd_password',
        message: 'Splunkd password:',
        default: configSplunkd.password,
        when: function(answers) {
          return (answers.storePassword === true);
        }
      }, {
        name: 'splunkd_scheme',
        message: 'Splunkd scheme',
        default: configSplunkd.scheme
      }, {
        name: 'splunkd_host',
        message: 'Splunkd host',
        default: configSplunkd.host
      }, {
        name: 'splunkd_port',
        message: 'Splunkd port',
        default: configSplunkd.port
      }, {
        name: 'splunkd_version',
        message: 'Splunkd version',
        default: configSplunkd.version
      }
    ], function(answers) {
      configStorage.save(_.extend(config, {
        splunkd: {
          username: answers.splunkd_username,
          password: (answers.storePassword ? answers.splunkd_password : null),
          scheme: answers.splunkd_scheme,
          host: answers.splunkd_host,
          port: answers.splunkd_port,
          version: answers.splunkd_version,
        },
        storePassword: answers.storePassword
      }));
      if (done) {
        done();
      }
    });
  },

  /*
   * Execute task under configuration.
   * If current Splunk instance is not configured yet -
   * current method will invoke configuration task first.
   */
  executeUnderConfiguration: function(task, done) {
    async.waterfall([
      // Check if current task requires configuration
      function(next) {
        // Some of the grunt tasks have requirement to get access to splunkd
        if (!this.validate()) {
          inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Current task requires configuration. Do you want to continue?',
              default: true
            }
          ], function(answers) {
            if (answers.confirm) {
              this.configure(function() {
                next(null);
              });
            } else {
              next(new Error('Canceled by user'));
            }
          }.bind(this));
        } else {
          next(null);
        }
      }.bind(this),
      // If configuration is ready launch grunt task
      task
    ], function(err) {
      if (done) {
        done(err);
      } else if (err) {
        console.error(err);
        process.exit(4);
      }
    });
  },

  /*
   * Validate current configuration.
   */
  validate: function() {
    var config = configStorage.get();

    if (!config) {
      return false;
    }

    if (!config.splunkd ||
      !config.splunkd.username ||
      (config.storePassword && !config.splunkd.password) ||
      !config.splunkd.scheme ||
      !config.splunkd.host ||
      !config.splunkd.port ||
      !config.splunkd.version) {
      return false;
    }

    return true;
  },

  /*
   * Gets configuration for current Splunk instance.
   */
  get: function() {
    return configStorage.get();
  },

  /*
   * Removes current configuration.
   */
  remove: function() {
    configStorage.remove();
  }
};