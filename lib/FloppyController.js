'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    SerialPort = require('serialport').SerialPort,
    music = require('./music');

/**
 * Creates a floppy drive controller.
 *
 * @param {string} [port]
 *   The serial interface (e.g. '/dev/tty0'). If the port is not specified,
 *   events will be written to the console.
 *
 * @class
 * @classdesc
 *   The floppy drive controller interface. Expects to communicate with a device
 *   {@link https://github.com/dstelljes/umm-floppy-choir/wiki/Serial-interface
 *   according to the specification in the project wiki}.
 * @extends {EventEmitter}
 */
module.exports = function(port) {

  // Call the parent constructor:
  EventEmitter.call(this);

  // Create self-reference:
  // @TODO find less ugly way to do this
  var self = this;

  /**
   * The number of active drives.
   */
  var drives = 0;

  /**
   * The controller's serial interface.
   * @type {?SerialPort}
   */
  var serial;

  /**
   * Converts a response sequence into an event.
   *
   * @param {Buffer} data
   *   The received bytes.
   */
  var react = function(data) {
    switch (data[0]) {
      // Ready:
      case module.exports.MESSAGE_OK:
        self.emit(module.exports.EVENT_READY);
        break;

      // Number of active drives:
      case module.exports.MESSAGE_ACTIVE:
        drives = data[1];
        self.emit(module.exports.EVENT_DRIVE_COUNT, data[1]);
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
  var send = function(command, p1, p2, p3) {
    if (typeof p1 === 'undefined') {
      p1 = 0;
    }

    if (typeof p2 === 'undefined') {
      p2 = 0;
    }

    if (typeof p3 === 'undefined') {
      p3 = 0;
    }

    if (!serial) {
      console.log('No device connected: [%d %d %d %d]', command, p1, p2, p3);
    }
    else {
      serial.write([command, p1, p2, p3]);
    }
  };

  /**
   * Connects the controller to a serial port.
   *
   * @param {string} port
   *   The path to the port (e.g. 'COM1', '/dev/tty0').
   */
  var connect = this.connect = function(port) {
    // @TODO close old port if necessary
    // @TODO handle invalid port

    // Create the new serial port instance:
    serial = new SerialPort(port, {
      baudrate: 9600,
      bufferSize: 2
    }, true)
    // @TODO deal with errors
    .on('open', function(error) {
      self.emit(module.exports.EVENT_OPENED);
    })
    .on('data', function(data) {
      react(data);
    })
    .on('close', function(error) {
      self.emit(module.exports.EVENT_CLOSED);
    })
    .on('error', function(error) {
      // fail spectacularly:
      console.trace(error);
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
  var setFrequency = this.setFrequency = function(drive, frequency) {
    // @TODO check ranges
    var f1 = frequency > 255 ? 255 : Math.round(frequency),
        f2 = frequency > 255 ? Math.round(frequency - 255) % 255 : 0;

    send(module.exports.MESSAGE_SET_FREQUENCY, drive, f1, f2);
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
  var setNote = this.setNote = function(drive, note, accidental, octave) {
    setFrequency(drive, music.pitchToFrequency(note, accidental, octave));
  };

  /**
   * Silences all connected drives.
   */
  var silence = this.silence = function() {
    for (var i = 0; i < drives; i++) {
      setFrequency(drive, 0);
    }
  };

  // If a port isn't specified, simulate a connection:
  if (!port) {
    console.log('No port specified; controller events will be written to the console.');

    setTimeout(function() {
      self.emit(module.exports.EVENT_OPENED);
      self.emit(module.exports.EVENT_READY);
      self.emit(module.exports.EVENT_DRIVE_COUNT, 4);
    });
  }
  // Otherwise, try to connect:
  else {
    connect(port);
  }
};

// In what scientists are calling the ugliest OOP of all time:
util.inherits(module.exports, EventEmitter);

/**
 * Indicates that a connection has been established with the device.
 * @constant
 */
module.exports.EVENT_OPENED = 'opened';

/**
 * Indicates that the device has signaled a ready state.
 * @constant
 */
module.exports.EVENT_READY = 'ready';

/**
 * Indicates a drive count report from the device.
 * @constant
 */
module.exports.EVENT_DRIVE_COUNT = 'count';

/**
 * Indicates that the connection with the device was closed.
 * @constant
 */
module.exports.EVENT_CLOSED = 'closed';

/**
 * General ping code.
 * @constant
 */
module.exports.MESSAGE_OK = 0o0;

/**
 * Indication that the last processed command was invalid.
 * @constant
 */
module.exports.MESSAGE_INVALID = 0o1;

/**
 * Marks a drive number packet.
 * @constant
 */
module.exports.MESSAGE_ACTIVE = 0o10;

/**
 * Marks a total reset packet.
 * @constant
 */
module.exports.MESSAGE_RESET_ALL = 0o11;

/**
 * Marks a drive reset packet.
 * @constant
 */
module.exports.MESSAGE_RESET_ONE = 0o12;

/**
 * Marks a frequency change packet.
 * @constant
 */
module.exports.MESSAGE_SET_FREQUENCY = 0o20;
