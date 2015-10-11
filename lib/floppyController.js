'use strict';

var EventEmitter = module.require('events').EventEmitter,
    SerialPort = module.require('serialport').SerialPort,
    music = require('music');

/**
 * Initializes the controller.
 *
 * @class
 * @classdesc
 *   The floppy drive controller interface. Expects to communicate with a device
 *   {@link https://github.com/dstelljes/umm-floppy-choir/wiki/Serial-interface
 *   according to the specification in the project wiki}.
 *
 * @param {string} port
 *   The serial interface (e.g. '/dev/tty0').
 */
var FloppyController = module.exports = function(port) {
  var self = this;

  // Set up an internal event system to respond asynchronously to serial
  // information:
  this.events = new EventEmitter();

  // Cache the ready state of the device:
  this.ready = false;

  this.events.on('ready', function() {
    self.ready = true;
  });

  // Connect to the device and attempt to open the connection immediately:
  this.serial = new SerialPort(port, {
    baudrate: 9600,
    bufferSize: 2
  }, true)
  // @todo deal with errors for all of these
  .on('open', function(error) {
    self.events.emit('open');
  })
  .on('data', function(data) {
    self.processBuffer(data, self.events);
  })
  .on('close', function(error) {
    self.events.emit('close');
  })
  .on('error', function(error) {
    // fail spectacularly:
    console.log(error);
  });
};

/**
 * Converts a response sequence into an event on the given emitter.
 *
 * @param {Buffer} data
 *   The received bytes.
 * @param {EventEmitter} emitter
 *   The event recipient.
 */
FloppyController.processBuffer = function(data, emitter) {
  switch (data[0]) {
    // Ready:
    case 0:
      emitter.emit('ready');
      break;

    // Number of active drives:
    case 8:
      emitter.emit('count', data[1]);
      break;
  }
};

/**
 * Requests a ready confirmation.
 *
 * @example
 * var fc = FloppyController('/dev/tty0');
 * fc.getReadyState().then(function() {
 *   console.log('The drive is ready!');
 * });
 *
 * @returns {Promise}
 *   A promise that resolves when the ready state of the drive is known.
 */
FloppyController.prototype.getReadyState = function() {
  var self = this;

  return new Promise(function(fulfill, reject) {
    if (self.ready) {
      fulfill(true);
    }
    else {
      self.serial.write([0, 0, 0, 0]);

      self.events.on('ready', function() {
        fulfill(true);
      });
    }
  });
};

/**
 * Requests the number of active drives. (This is hardcoded into the Arduino
 * control code.)
 *
 * @example
 * var fc = FloppyController('/dev/tty0');
 * fc.getDriveCount().then(function(count) {
 *   console.log('There are %d drives active.', count);
 * });
 *
 * @returns {Promise}
 *   A promise that resolves when the number of active drives is
 *   known.
 */
FloppyController.prototype.getDriveCount = function() {
  var self = this;

  return new Promise(function(fulfill, reject) {
    self.getReadyState().then(function() {
      self.serial.write([8, 0, 0, 0]);

      self.events.on('count', function(count) {
        fulfill(count);
      });
    });
  });
};

/**
 * Sets the frequency of a drive.
 *
 * @example
 * var fc = FloppyController('/dev/tty0');
 * // plays a tuning A for two seconds
 * fc.setFrequency(0, 440);
 * setTimeout(function() {
 *   fc.setFrequency(0, 0);
 * }, 2000);
 *
 * @param {number} drive
 *   The number of the target drive.
 * @param {number} frequency
 *   The target frequency (Hz). 0 will silence the drive.
 */
FloppyController.prototype.setFrequency = function(drive, frequency) {
  var self = this;

  // @todo check ranges
  var f1 = frequency % 255,
      f2 = frequency > 255 ? (frequency - 255) % 255 : 0;

  this.getReadyState().then(function() {
    self.serial.write([16, drive, f1, f2]);
  });
};

/**
 * Sets a note on a drive.
 *
 * @example
 * var fc = FloppyController('/dev/tty0'),
 *     music = require('music');
 * // plays a D#2 on drive 1
 * fc.setNote(1, 'D', music.SHARP, 2);
 *
 * @param {number} drive
 *   The number of the target drive.
 * @param {string} note
 *   The note name (e.g. 'A').
 * @param {number} accidental
 *   The applied accidental (music.FLAT, music.NATURAL, etc.). This can also be
 *   used as +/- half steps.
 * @param {number} octave
 *   The octave number. (Octaves begin on C; C4 is middle C.)
 */
FloppyController.prototype.setNote = function(drive, note, accidental, octave) {
  this.setFrequency(drive, music.toFrequency(note, accidental, octave));
};
