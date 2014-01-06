/*jshint globalstrict: true*/ 'use strict';

var _ = require('underscore'),
    App = require('./app'),
    environment = require('./environment'),
    fs = require('fs'),
    remove = require('remove'),
    path = require('path'),
    minimatch = require("minimatch"),
    ini = require('ini');

var Apps = function() {
  var _self = this;

  /*
   * Get installed Splunk applications.
   *
   * @param criteria - allows to filter apps
   *                   'system' - include system apps
   *                   'disabled' - include disabled apps
   *                   'filter' - filter apps by name
   */
  _self.findAll = function(criteria) {
    criteria = criteria || {};
    var result = [];

    // Find all directories under splunk/etc/apps and check if they are directories
    var pathSplunkApps = environment.splunkApps();
    var files = fs.readdirSync(pathSplunkApps);
    _.each(files, function(appname) {
      var stats = fs.lstatSync(path.join(pathSplunkApps, appname));
      // Verify first that this is dir (or symlink)
      if (stats.isDirectory() || stats.isSymbolicLink()) {
        // If we have filter - let's filter everything which does not match
        if (!criteria.filter || minimatch(appname, criteria.filter)) {
          var app = new App(appname);
          // Filter non-user applications
          if (criteria.system || !app.isSystem()) {
            // Last check for if application is disabled
            if (criteria.disabled || !app.disabled()) {
              result.push(app);
            }
          }
        }
      }
      
    });

    return result;
  };

  /*
   * Gets current application if current working directory
   * is under one of the applications in Splunk apps directory.
   */
  _self.getCurrentApp = function() {
    var workDir = process.cwd();
    if (environment.isWindows()) {
      workDir = workDir.toUpperCase();
    }
    if (workDir.indexOf(environment.splunkApps()) === 0) {
      var workDirSep = workDir.split(path.sep);
      var splunkAppPathSep = environment.splunkApps().split(path.sep);
      if (workDirSep.length > splunkAppPathSep.length) {
        return new App(workDirSep[splunkAppPathSep.length]);
      }
    }
    return null;
  };

  _self.create = function(appname) {
    var app = new App(appname);
    if (!app.exists()) {
      app.createAppDir();
    }
    return app;
  };
};

module.exports = new Apps();