/*jshint globalstrict: true*/ 'use strict';

var archiver = require('archiver'),
    path = require('path'),
    zlib = require('zlib'),
    fs = require('fs');

module.exports = function(grunt) {
  grunt.registerTask('splunk-pack', 'Pack application into tar.gz archive for uploading to the store', function() {
    var sourceDir = grunt.config('splunk.pack.sourceDir') || process.cwd();
    var source = grunt.config('splunk.pack.source') || ['**/*'];
    var outputFile = grunt.config('splunk.pack.output') || path.join(sourceDir, 'app.tar.gz');

    var gzipper = zlib.createGzip();
    var output = fs.createWriteStream(outputFile);
    var archive = archiver('tar');

    var done = this.async();

    output.on('close', function() {
      grunt.log.debug('archiver has been finalized and the output file descriptor has closed.');
    });

    archive.on('error', function(err) {
      grunt.fatal(err);
    });

    archive.pipe(gzipper).pipe(output);

    archive.bulk([
      { expand: true, cwd: sourceDir, src: source }
    ]);

    archive.finalize(function(err, bytes) {
      if (err) {
        grunt.fatal(err);
      }

      grunt.log.debug('archiver created with ' + bytes + ' total bytes.');
      grunt.log.writeln('Package "' + outputFile + '" is ready.');
      done();
    });
  });
};