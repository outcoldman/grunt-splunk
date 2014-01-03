/*jshint globalstrict: true*/ 'use strict';

var _ = require('underscore'),
    environment = require('./environment'),
    fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml');

var DEFAULTS = {
  splunkd: {
    username: 'admin',
    password: null,
    scheme: 'https',
    host: 'localhost',
    port: '8089',
    version: '6.0'
  },
  storePassword: false
};

var ConfigStorage = function() {
  var _self = this;
  var _configFile = path.resolve(environment.getUserHome(), '.splunkcli');

  var _saveConfigurations = function(configs) {
    // Replace passwords with base64
    _.each(configs, function(config) {
      if (config.splunkd.password) {
        config.splunkd.password = new Buffer(config.splunkd.password).toString('base64');
      }
    });
    fs.writeFileSync(_configFile, yaml.safeDump(configs), environment.encoding());
  };

  var _loadConfigurations = function() {
    var configs = {};
    if (fs.existsSync(_configFile)) {
      try {
        configs = yaml.safeLoad(fs.readFileSync(_configFile, environment.encoding())) || {};
      } catch (err) {
        console.error(err);
      }
    }
    _.each(configs, function(config) {
      if (config.splunkd.password) {
        config.splunkd.password = new Buffer(config.splunkd.password, 'base64').toString('utf8');
      }
    });
    return configs;
  };

  var _get = function() {
    var configs = _loadConfigurations();
    return configs[environment.splunkHome()];
  };

  _self.get = function() {
    var config = _.clone((_get() || DEFAULTS));
    config.splunkHome = environment.splunkHome();
    return config;
  };

  _self.save = function(config) {
    delete config.splunkHome;
    var configs = _loadConfigurations();
    configs[environment.splunkHome()] = config;
    _saveConfigurations(configs);
  };

  _self.remove = function() {
    var configs = _loadConfigurations();
    delete configs[environment.splunkHome()];
    if (_.size(configs) === 0) {
      fs.unlinkSync(_configFile);
    } else {
      _saveConfigurations(configs);
    }
  };
};

module.exports = new ConfigStorage();