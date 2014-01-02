# grunt-splunk

> Grunt tasks for building Splunk applications.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-splunk --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-splunk');
```

## List of tasks

### Grunt "splunk-services" task

This task allow you to manipulate Splunk services. 

#### Requirements

This task expects configuration:

```
grunt.config.init({
  splunk: {
    splunkHome: '/path/to/Splunk/home/folder',
    splunkd: {
      username: 'admin',
      password: 'splunkd_password',
      scheme: 'https',
      host: 'localhost',
      port: '8089',
      version: '6.0'
    }
  }
});
```

If you have [splunk-cli](github.com/splunk/splunk-cli) installed  - you can run `splunk-cli config` to save configuration for specific Splunk instance and load it with next code snipped:

```
grunt.config.init({
  splunk: require('grunt-splunk/lib/configuration').get()
});
```

#### Available task options

* `splunk-services:reload-apps` - reload application configurations
* `splunk-services:*:start` - start all Splunk services
* `splunk-services:*:stop` - stop all Splunk services
* `splunk-services:*:restart` - restart all Splunk services
* `splunk-services:splunkweb:start` - start splunkweb service
* `splunk-services:splunkweb:stop` - stop splunkweb service
* `splunk-services:splunkweb:restart` - restart splunkweb service
* `splunk-services:splunkd:start` - start splunkd service
* `splunk-services:splunkd:stop` - stop splunkd service
* `splunk-services:splunkd:restart` - restart splunkd service

### Grunt "splunk-watch" task

Task watches for changes under Splunk home folder and do required steps, like call livereload or reload Splunk app configurations or restart required Splunk services.

#### Requirements

This task depends on "splunk-contrib-watch" task.

#### Available task options

* `splunk-watch:apps:*` - watch for all Splunk applications
* `splunk-watch:apps:[appname]` - watch for specific application [appname]
* `splunk-watch:splunk` - watch for changes in Splunk (core components)
* `splunk-watch:*` - watch for all applications and core components

#### Notes

Implementation of task "splunk-watch" configure and launch grunt task "grunt-contrib-watch". If you need to use "grunt-contrib-watch" at the same time as you use "splunk-watch" - you will need to use `lib/watchConfig` module and just launch "watch" task from "grunt-contrib-watch". For example:

```

var splunkWatchConfig = require('grunt-splunk/lib/watchConfig');

var watchConfig = { /* ... your watch configuration ... */ };
// If you need to watch for application changes
splunkWatchConfig.watchForApp(watchConfig, 'application_name');
// If you need to watch for core Splunk components
splunkWatchConfig.watchForSplunk(watchConfig);

// Configure grunt
grunt.config.init({
  watch: watchConfig
});

// Use watch task by default
grunt.registerTask('default', ['watch']);

```

## Other useful hidden API

### Module "grunt-splunk/lib/environment"

#### Function "splunkHome" 

Helps to discover current Splunk home directory. It checks first for `SPLUNK_HOME` environment variable, after that checks if current working directory is subfolder of Splunk folder.

```
var splunkHome = require('grunt-splunk/lib/environment').splunkHome();
```

### Module "grunt-splunk/lib/apps"

#### Function "getCurrentApp"

Gets current application if current working directory is under one of the applications in Splunk apps directory.

```
var currentApp = require('grunt-splunk/lib/apps').getCurrentApp();
if (!currentApp) {
  var applicationName = currentApp.name();
  var pathToApplication = currentApp.path();
}
```

## Release History
_(Nothing yet)_
