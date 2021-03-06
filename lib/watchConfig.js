/*jshint globalstrict: true*/ 'use strict';

var _ = require('underscore'),
    environment = require('./environment'),
    path = require('path');

var WatchConfig = function() {
  var _self = this;

  /*
   * Add specific for etc/apps configuration or
   * for particular application `app` if specified.
   */
  _self.watchForApp = function(config, app) {
    if (_.isUndefined(app)) {
      app = '*';
    }
    var appsFilter = path.join('etc', 'apps', app === '*' ? '**' : app);

    // Hard restart
    config['splunk-apps-' + app + '-config-hard'] = {
      files: [
        environment.resolve(path.join(appsFilter, 'default', 'inputs.conf')),
        environment.resolve(path.join(appsFilter, 'default', 'props.conf')),
        environment.resolve(path.join(appsFilter, 'local', 'inputs.conf')),
        environment.resolve(path.join(appsFilter, 'local', 'props.conf'))
      ],
      tasks: ['splunk-services:*:restart'],
      options: {
        spawn: false,
      }
    };

    // Soft reload
    config['splunk-apps-' + app + '-config'] = {
      files: _.union([
        environment.resolve(path.join(appsFilter, 'default', '**', '*.conf')),
        environment.resolve(path.join(appsFilter, 'default', '**', '*.xml')),
        environment.resolve(path.join(appsFilter, 'local', '**', '*.conf')),
        environment.resolve(path.join(appsFilter, 'local', '**', '*.xml')),
        environment.resolve(path.join(appsFilter, 'appserver', '**', '*.tmpl'))
      ], _(config['splunk-apps-' + app + '-config-hard'].files).map(function(f) {
        // Don't include files which require hard restart
        return '!' + f;
      })),
      tasks: ['splunk-services:reload-apps'],
      options: {
        spawn: false,
      }
    };

    // Web restart
    config['splunk-apps-' + app + '-web'] = {
      files: [
        environment.resolve(path.join(appsFilter, 'django', '**', '*.py'))
      ],
      tasks: ['splunk-services:splunkweb:restart'],
      options: {
        spawn: false,
      }
    };

    // Live reload
    config['splunk-apps-' + app + '-live'] = {
      files: [
        environment.resolve(path.join(appsFilter, 'django', '**', '*.js')),
        environment.resolve(path.join(appsFilter, 'django', '**', '*.css')),
        environment.resolve(path.join(appsFilter, 'django', '**', '*.html'))
      ],
      options: {
        livereload: true,
      }
    };

    return config;
  };

  /*
   * Add specific for share/splunk configuration.
   */
  _self.watchForSplunk = function(config) {
    config['splunk-web'] = {
      files: [
        environment.resolve(path.join('share', 'splunk', '**', '*.py'))
      ],
      tasks: ['splunk-services:splunkweb:restart'],
      options: {
        spawn: false,
      }
    };

    return config;
  };

};

module.exports = new WatchConfig();