/*jshint globalstrict: true*/ 'use strict';

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path');

var Environment = function() {
  var _self = this;
  var _splunkHome = null;
  var _encoding = 'utf8';

  var _hasSplunkBinary = function(dir) {
    var splunkBin = path.join('bin', _self.isWindows() ? 'splunk.exe' : 'splunk');
    var splunkBinFullPath = path.join(dir, splunkBin);
    return fs.existsSync(splunkBinFullPath);
  };

  var _searchSplunkHome = function() {
    if (process.env.SPLUNK_HOME) {
      return process.env.SPLUNK_HOME;
    } else {
      var currentDir = process.cwd();
      while (currentDir) {
        if (_hasSplunkBinary(currentDir)) {
          return currentDir;
        }
        var dirname = path.dirname(currentDir);
        currentDir = (dirname === currentDir) ? '' : dirname;
      }
    }
    return '';
  };

  /*
   * Verifies if current OS is Windows.
   */
  _self.isWindows = function() {
    return process.platform === 'win32';
  };

  /*
   * Gets or sets home directory of current Splunk instance.
   */
  _self.splunkHome = function(value) {
    if (!_.isUndefined(value)) {
      process.env.SPLUNK_HOME = _splunkHome = value;
    }
    if (_.isUndefined(process.env.SPLUNK_HOME)) {
      process.env.SPLUNK_HOME = _searchSplunkHome();
    }
    return process.env.SPLUNK_HOME;
  };

  /*
   * Gets path to Splunk apps.
   */
  _self.splunkApps = function() {
    return _self.resolve(path.join('etc', 'apps'));
  };

  /*
   * Resolves splunk relative path.
   */
  _self.resolve = function(relative) {
    var splunkHome = this.splunkHome();
    return splunkHome ? path.resolve(splunkHome, relative) : relative;
  };

  /*
   * Gets current user home directory.
   */
  _self.getUserHome = function() {
    return process.env[_self.isWindows() ? 'USERPROFILE' : 'HOME'];
  };

  /*
   * Gets or sets default encoding for files (when read/save configurations).
   */
  _self.encoding = function(value) {
    if (!_.isUndefined(value)) {
      _encoding = value;
    }
    return _encoding;
  };
};

module.exports = new Environment();