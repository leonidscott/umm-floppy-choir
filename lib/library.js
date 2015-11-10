'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
    MIDIParser = require('./midiParser');

var resolveParser = function(extension) {
  switch (extension) {
    case '.mid':
    case '.midi':
      return MIDIParser;

    default:
      return null;
  }
};

var Library = module.exports = function(directory) {
  var self = this;

  if (typeof directory !== 'undefined') {
    self.setDirectory(directory);
  }
};

Library.prototype.directory = null;

Library.prototype.files = null;

Library.prototype.readFile = function(id) {
  var self = this;

  return new Promise(function(resolve, reject) {
    if (!self.directory) {
      return reject();
    }

    if (!(id in self.files)) {
      return reject(new Error('The requested file does not exist.'));
    }

    fs.readFile(self.files[id].path, function(error, data) {
      if (error) {
        return reject();
      }

      resolve(data);
    });
  });
};

Library.prototype.refresh = function() {
  var self = this;

  // Holy asynchronicity, Batman.
  return new Promise(function(resolve, reject) {
    if (!self.directory) {
      return reject();
    }

    fs.readdir(self.directory, function(error, files) {
      if (error) {
        return reject();
      }

      var remaining = files.length;
      var results = {};

      files.forEach(function(file) {
        var filepath = path.join(self.directory, file);

        fs.stat(filepath, function(error, stats) {
          // @TODO just skip it?
          if (error) {
            // om nom nom
          }

          if (stats.isFile()) {
            var components = path.parse(filepath);
            var hash = crypto.createHash('md5');
            var stream = fs.ReadStream(filepath);

            stream.on('data', function(data) {
              hash.update(data);
            });

            stream.on('end', function() {
              var id = hash.digest('hex');
              var parser = resolveParser(components.ext);

              if (parser) {
                results[id] = {
                  id: id,
                  name: components.name,
                  parser: resolveParser(components.ext),
                  // @TODO getter method should exclude internal path
                  path: filepath
                };
              }

              if (--remaining === 0) {
                self.files = results;
                return resolve();
              }
            });
          }
        });
      });
    });
  });
};

Library.prototype.setDirectory = function(directory) {
  var self = this;

  self.directory = null;
  self.files = null;

  return new Promise(function(resolve, reject) {
    fs.stat(directory, function(error, stats) {
      // @TODO handle this better
      if (error || !stats.isDirectory()) {
        return reject();
      }

      // realpath normalizes the path to the directory so we don't end up with
      // weird issues later.
      fs.realpath(directory, function(error, path) {
        // @TODO this too
        if (error) {
          return reject();
        }

        self.directory = path;
        self.refresh();
      });
    });
  });
};
