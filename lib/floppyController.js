'use strict';

/**
 * The floppy drive controller interface. Expects to communicate with
 * a device according to the specification outlined in the project
 * wiki.
 */

var EventEmitter = module.require('events').EventEmitter,
    SerialPort = module.require('serialport').SerialPort;

/**
 * Initializes the controller.
 *
 * @constructor FloppyController
 * @param {string} port
 *   The serial interface (e.g. '/dev/tty0').
 */
var FloppyController = module.exports = function(port) {
  var self = this;

  // Set up an internal event system to respond asynchronously to
  // serial information:
  this.events = new EventEmitter();

  // Cache the ready state of the device:
  this.ready = false;

  this.events.on('ready', function() {
    self.ready = true;
  });

  // Connect to the device and attempt to open the connection
  // immediately:
  this.serial = new SerialPort(port, {
    baudrate: 9600,
    bufferSize: 2
  }, true)
  // @todo deal with errors for all of these
  .on('open', function(error) {
    self.events.emit('open');

    self.setFrequency(0, 220);
  })
  .on('data', function(data) {
    self.processData(data, self.events);
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
 * Emits events as serial data is received.
 *
 * @param {Buffer} data
 *   The received bytes.
 * @param {EventEmitter} emitter
 *   The event recipient.
 */
FloppyController.prototype.processData = function(data, emitter) {
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
 * @returns {Promise}
 *   A promise that resolves when the ready state of the drive is
 *   known.
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
 * Requests the number of active drives. (This is hardcoded into the
 * Arduino control code.)
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
 * @param {number} drive
 *   The number of the target drive.
 * @param {number} frequency
 *   The target frequency. 0 will silence the drive.
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
