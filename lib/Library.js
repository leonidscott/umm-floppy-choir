'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MIDIParser = require('./MIDIParser');

module.exports = class Library {

  /**
   * Creates a library manager.
   *
   * @class
   * @classdesc
   * An object that handles retrieving and parsing songs from the filesystem.
   */
  constructor() {
    this._files = [];
  }

  add(path) {
    const flow =
      new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => error
          ? reject(new Error(`The file ${path} could not be read.`))
          : resolve(data)
        )
      })
      .then(data => {
        const changes = this.parse(data);
        const id = this.hash(data);
        const name = this.title(path);

        if (!changes || !!this._files[id])
          return;

        console.log('✓ ' + name);

        return this._files[id] = {
          id: id,
          name: name,
          changes: changes,
          path: path
        };
      });

    return flow;
  }

  get(hash) {
    if (!(hash in files))
      throw new Error('The requested file does not exist.');

    return files[hash];
  }

  hash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  parse(data) {
    // "MThd" is the MIDI file header:
    if (data[0] === 0x4d && data[1] === 0x54 && data[2] === 0x68 && data[3] === 0x64)
      return MIDIParser.parse(data);

    return null;
  }

  scan(directory) {
    console.log(`Looking for music in ${directory}:`);

    let flow =
      new Promise((resolve, reject) => {
        fs.readdir(directory, (error, bases) => error
          ? reject(new Error(`The directory ${directory} could not be read.`))
          : resolve(bases)
        )
      })
      .then(bases => bases.map(base => path.join(directory, base)))
      .then(paths => Promise.all(paths.map(path => this.add(path))))
      .then(results => results.filter(result => !!result))
      .then(results => {
        console.log(`${results.length} songs loaded.`);
      });

    return flow;
  }

  title(file) {
    return path.parse(file).name;
  }

};
