'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
    MIDIParser = require('./MIDIParser');

/**
 * Creates a library manager.
 *
 * @class
 * @classdesc
 *   An object that handles retrieving and parsing songs from the filesystem.
 */
module.exports = function() {
  var files = [];

  var hash = function(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  };

  var list = function(files) {
    var results = [];

    for (var id in files) {
      results.push({
        id: id,
        name: files[id].name
      });
    }

    return results;
  };

  var parse = function(data) {
    // "MThd" is the MIDI file header:
    if (data[0] === 0x4d && data[1] === 0x54 && data[2] === 0x68 && data[3] === 0x64) {
      return MIDIParser.parse(data);
    }

    return null;
  };

  var title = function(filepath) {
    return path.parse(filepath).name;
  };

  this.get = function(id) {
    if (!(id in files)) {
      throw new Error('The requested file does not exist.');
    }

    return files[id];
  };

  this.ingest = function(directory) {
    // Holy asynchronicity, Batman.
    return new Promise(function(resolve, reject) {
      fs.readdir(directory, function(error, bases) {
        if (error) {
          return reject(new Error('The specified directory could not be read.'));
        }

        console.log('Loading songs from ' + directory + ':');

        var remaining = bases.length;
        var results = {};

        bases.forEach(function(base) {
          var filepath = path.join(directory, base);

          fs.stat(filepath, function(error, stats) {
            if (error) {
              console.warn('Error reading file ' + file + '.');
            }

            if (stats.isFile()) {
              fs.readFile(filepath, function(error, data) {
                if (error) {
                  console.warn('Error reading file ' + file + '.');
                }

                var changes = parse(data);
                var id = hash(data);
                var name = title(filepath);

                if (changes && !(id in files)) {
                  results[id] = {
                    id: id,
                    name: name,
                    changes: changes,
                    path: filepath
                  };

                  console.log('✓ ' + name);
                }

                if (--remaining === 0) {
                  Object.assign(files, results);
                  resolve(list(files));

                  console.log(Object.keys(results).length + ' songs loaded.');
                }
              });
            }
          });
        });
      });
    });
  };
};
