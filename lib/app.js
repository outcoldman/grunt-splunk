/*jshint globalstrict: true*/ 'use strict';

var _ = require('underscore'),
    chalk = require('chalk'),
    environment = require('./environment'),
    fs = require('fs'),
    path = require('path'),
    ini = require('ini'),
    remove = require('remove');

// TODO: Find the real list and sort them
var _notUserApps = [
  'quickstartfx', 
  'homefx', 
  'examplesfx', 
  'componentfx', 
  'testfx',
  'SplunkForwarder',
  'SplunkLightForwarder',
  'framework',
  'gettingstarted',
  'search',
  'launcher',
  'learned',
  'legacy',
  'splunk_datapreview',
  'user-prefs'
];

/*
 * Application instance.
 */
var App = function(appname) {
  var _self = this;
  var _appname = appname;

  var _pathToConfigFile = function(type) {
    return path.join(_self.path(), type, 'app.conf');
  };

  var _loadAppConfig = function(type) {
    var configFile = _pathToConfigFile(type);
    if (fs.existsSync(configFile)) {
      return ini.parse(fs.readFileSync(configFile, environment.encoding()));
    }
    return null;
  };

  var _saveAppConfig = function(type, config) {
    var configFile = _pathToConfigFile(type);
    var configLocation = path.dirname(configFile);
    if (!fs.existsSync(configLocation)) {
      fs.mkdirSync(configLocation);
    }
    fs.writeFileSync(configFile, ini.stringify(config));
  };

  /*
   * Get application name (based on the path to application).
   */
  _self.name = function() {
    return _appname;
  };

  _self.displayName = function() {
    return _appname +
      chalk.cyan((_self.isSystem() ? ' (system)' : '')) +
      chalk.gray((_self.disabled() ? ' (disabled)' : ''));
  };

  /*
   * Get full path to application.
   */
  _self.path = function() {
    return path.join(environment.splunkApps(), _appname);
  };

  /*
   * Gets or sets a value indicating whether current application is disabled.
   */
  _self.disabled = function(value) {
    _self.exists(/* safeCheck: */ false);
    if (!_.isUndefined(value)) {
      var config = _loadAppConfig('local') || {};
      (config.install || (config.install = {})).state = value ? 'disabled' : 'enabled';
      _saveAppConfig('local', config);
    }
    return _.any(['local', 'defaults'], function(configDir) {
      var config = _loadAppConfig(configDir);
      if (config && config.install && config.install.state === 'disabled') {
        return true;
      }
      return false;
    });
  };

  /*
   * Gets a value indicating whether current application exists.
   *
   * @param safeCheck - can be used to throw error if application does not exist.
   */
  _self.exists = function(safeCheck) {
    if (_.isUndefined(safeCheck)) {
      safeCheck = true;
    }
    var exists = fs.existsSync(_self.path());
    if (!exists && !safeCheck) {
      throw new Error('Application with name "' + _self.name() + '" does not exist.');
    }
    return exists;
  };

  /*
   * Create application.
   */
  _self.createAppDir = function() {
    if (_self.exists()) {
      throw new Error('Application with name "' + _self.name() + '" already exists.');
    }
    fs.mkdirSync(_self.path());
  };

  /*
   * Remove application.
   */
  _self.remove = function() {
    _self.exists(/* safeCheck: */ false);
    remove.removeSync(_self.path());
  };

  /*
   * Gets a value indicating whether current application is system application.
   */
  _self.isSystem = function() {
    return _.any(_notUserApps, function(notUserApp) {
      if (environment.isWindows()) {
        return notUserApp.toUpperCase() === _self.name().toUpperCase();
      } else {
        return notUserApp === _self.name();
      }
    });
  };
};

module.exports = App;