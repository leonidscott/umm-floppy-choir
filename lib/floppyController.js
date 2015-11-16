'use strict';

var EventEmitter = module.require('events').EventEmitter,
    SerialPort = module.require('serialport').SerialPort,
    util = module.require('util'),
    music = module.require('./music');

/**
 * Initializes the controller.
 *
 * @class
 * @classdesc
 *   The floppy drive controller interface. Expects to communicate with a device
 *   {@link https://github.com/dstelljes/umm-floppy-choir/wiki/Serial-interface
 *   according to the specification in the project wiki}.
 * @extends {EventEmitter}
 *
 * @param {string} [port]
 *   The serial interface (e.g. '/dev/tty0'). If the port is not specified,
 *   events will be written to the console.
 */
var FloppyController = module.exports = function(port) {
  var self = this;

  // Call the parent constructor:
  EventEmitter.call(self);

  // If a port is specified, connect:
  if (typeof port !== 'undefined') {
    self.setPort(port);
  }

  self.on('open', function() {
    self.status = FloppyController.STATUS_CONNECTED;

    self.once('ready', function() {
      self.status = FloppyController.STATUS_READY;

      self.sendCommand(FloppyController.MESSAGE_ACTIVE);
    });
  });

  self.on('count', function(count) {
    self.drives = count;
  });

  self.on('close', function() {
    self.status = FloppyController.STATUS_ERROR;
  });
};

// In what scientists are calling the ugliest OOP of all time:
util.inherits(FloppyController, EventEmitter);

/**
 * General ping code.
 * @constant
 */
FloppyController.MESSAGE_OK = 0; // 000

/**
 * Indication that the last processed command was invalid.
 * @constant
 */
FloppyController.MESSAGE_INVALID = 1; // 001

/**
 * Marks a drive number packet.
 * @constant
 */
FloppyController.MESSAGE_ACTIVE = 8; // 010

/**
 * Marks a total reset packet.
 * @constant
 */
FloppyController.MESSAGE_RESET_ALL = 9; // 011

/**
 * Marks a drive reset packet.
 * @constant
 */
FloppyController.MESSAGE_RESET_ONE = 10; // 012

/**
 * Marks a frequency change packet.
 * @constant
 */
FloppyController.MESSAGE_SET_FREQUENCY = 16; // 020

/**
 * The controller is not attached to a port.
 * @constant
 */
FloppyController.STATUS_UNATTACHED = 0;

/**
 * The controller is attached to a port, but has not yet established
 * communication with the device.
 * @constant
 */
FloppyController.STATUS_CONNECTING = 1;

/**
 * The controller is able to communicate with the device.
 * @constant
 */
FloppyController.STATUS_CONNECTED = 2;

/**
 * The controller is able to communicate with the device and the device is able
 * to receive commands.
 * @constant
 */
FloppyController.STATUS_READY = 3;

/**
 * The controller is attached to a port, but has given up trying to communicate
 * with the device. :(
 * @constant
 */
FloppyController.STATUS_ERROR = 4;

/**
 * The number of drives attached to the controller.
 * @type {number}
 */
FloppyController.prototype.drives = 0;

/**
 * The controller's serial interface.
 * @type {?SerialPort}
 */
FloppyController.prototype.serial = null;

/**
 * The controller's status.
 */
FloppyController.prototype.status = FloppyController.STATUS_UNATTACHED;

/**
 * Converts a response sequence into an event.
 *
 * @param {Buffer} data
 *   The received bytes.
 */
FloppyController.prototype.processBuffer = function(data) {
  switch (data[0]) {
    // Ready:
    case FloppyController.MESSAGE_OK:
      this.emit('ready');
      break;

    // Number of active drives:
    case FloppyController.MESSAGE_ACTIVE:
      this.emit('count', data[1]);
      break;
  }
};

/**
 * Sends a command to the device.
 *
 * @param {number} command
 *   The command code.
 * @param {number} [p1=0]
 *   The first parameter.
 * @param {number} [p2=0]
 *   The second parameter.
 * @param {number} [p3=0]
 *   The third parameter.
 */
FloppyController.prototype.sendCommand = function(command, p1, p2, p3) {
  if (typeof p1 === 'undefined')
    p1 = 0;

  if (typeof p2 === 'undefined')
    p2 = 0;

  if (typeof p3 === 'undefined')
    p3 = 0;

  if (!this.serial) {
    console.log('No device connected: [%d %d %d %d]', command, p1, p2, p3);
  }
  else {
    this.serial.write([command, p1, p2, p3]);
  }
};

/**
 * Attaches the controller to a serial port.
 *
 * @param {string} port
 *   The path to the port (e.g. 'COM1', '/dev/tty0').
 */
FloppyController.prototype.setPort = function(port) {
  var self = this;

  // @TODO close old port if necessary
  // @TODO handle invalid port

  // Create the new serial port instance:
  this.serial = new SerialPort(port, {
    baudrate: 9600,
    bufferSize: 2
  }, true)
  // @TODO deal with errors
  .on('open', function(error) {
    self.emit('open');
  })
  .on('data', function(data) {
    self.processBuffer(data);
  })
  .on('close', function(error) {
    self.emit('close');
  })
  .on('error', function(error) {
    // fail spectacularly:
    console.trace(error);
  });
};

/**
 * Requests the number of active drives. (This is hardcoded into the Arduino
 * control code.) Will return some arbitrary number if the controller is not
 * attached to a device.
 *
 * @returns {number}
 *   The number of active drives.
 */
FloppyController.prototype.getDriveCount = function() {
  return this.serial ? this.drives : 4;
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
  // @TODO check ranges
  var f1 = frequency > 255 ? 255 : Math.round(frequency),
      f2 = frequency > 255 ? Math.round(frequency - 255) % 255 : 0;

  this.sendCommand(FloppyController.MESSAGE_SET_FREQUENCY, drive, f1, f2);
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
  this.setFrequency(drive, music.pitchToFrequency(note, accidental, octave));
};

/**
 * Silences all drives.
 */
FloppyController.prototype.silence = function() {
  for (var i = 0; i < this.drives; i++) {
    this.setFrequency(i, 0);
  }
};
