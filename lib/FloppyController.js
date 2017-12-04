'use strict';

const EventEmitter = require('events');
const SerialPort = require('serialport');

const music = require('./music');

module.exports = class FloppyController extends EventEmitter {

  /**
   * Creates a floppy drive controller.
   *
   * @param {string} [port]
   * The serial interface (e.g. '/dev/tty0'). If the port is not specified,
   * events will be written to the console.
   *
   * @class
   * @classdesc
   * The floppy drive controller interface. Expects to communicate with a device
   * {@link https://github.com/morrislenny/umm-floppy-choir/wiki/Serial-interface
   * according to the specification in the project wiki}.
   */
  constructor(port) {
    super();

    this._drives = 0;
    this._serial = null;

    // If a port isn't specified, try to connect:
    if (port) {
      this.connect(port);
    }
    // Otherwise, simulate a connection:
    else {
      console.log('No port specified; controller events will be written to the console.');

      // Delay the first emits so listeners have a chance to subscribe:
      setTimeout(() => {
        this.emit(FloppyController.EVENT_OPENED);
        this.emit(FloppyController.EVENT_READY);
        this.emit(FloppyController.EVENT_DRIVE_COUNT, 4);
      });
    }
  }

  /**
   * Connects the controller to a serial port.
   *
   * @param {string} port
   *   The path to the port (e.g. 'COM1', '/dev/tty0').
   */
  connect(port) {
    // @TODO close old port if necessary
    // @TODO handle invalid port

    // Create the new serial port instance:
    this._serial =
      new SerialPort(port, {
        baudRate: 9600,
        highWaterMark: 2
      })
      .on('open', error => this.emit(FloppyController.EVENT_OPENED))
      .on('data', data => this.process(data))
      .on('close', error => this.emit(FloppyController.EVENT_CLOSED))
      .on('error', error => console.trace(error));
  }

  /**
   * Converts a response sequence into an event.
   *
   * @param {Buffer} data
   *   The received bytes.
   */
  receive(data) {
    switch (data[0]) {
      // Ready:
      case FloppyController.MESSAGE_OK:
        this.emit(FloppyController.EVENT_READY);
        break;

      // Number of active drives:
      case FloppyController.MESSAGE_ACTIVE:
        const count = data[1];

        this._drives = count;
        this.emit(FloppyController.EVENT_DRIVE_COUNT, count);
        break;
    }
  }

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
  send(command, p1 = 0, p2 = 0, p3 = 0) {
    if (this._serial === null)
      console.log(`No device connected: 0o${command.toString(8)} ${p1} ${p2} ${p3}`);
    else
      this._serial.write(Buffer.from([command, p1, p2, p3]));
  }

  /**
   * Sets the frequency of a drive.
   *
   * @example
   * const fc = new FloppyController('/dev/tty0');
   * // plays a tuning A for two seconds
   * fc.setFrequency(0, 440);
   * setTimeout(() => {
   *   fc.setFrequency(0, 0);
   * }, 2000);
   *
   * @param {number} drive
   *   The number of the target drive.
   * @param {number} frequency
   *   The target frequency (Hz). 0 will silence the drive.
   */
  setFrequency(drive, frequency) {
    const f1 = frequency > 255 ? 255 : Math.round(frequency);
    const f2 = frequency > 255 ? Math.round(frequency - 255) % 255 : 0;

    this.send(FloppyController.MESSAGE_SET_FREQUENCY, drive, f1, f2);
  }

  /**
   * Sets a note on a drive.
   *
   * @example
   * const fc = new FloppyController('/dev/tty0'),
   * const music = require('music');
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
  setNote(drive, note, accidental, octave) {
    this.setFrequency(drive, music.pitchToFrequency(note, accidental, octave));
  }

  silence() {
    for (let drive = 0; drive < this._drives; drive++) {
      this.setFrequency(drive, 0);
    }
  }

};

/**
 * Indicates that a connection has been established with the device.
 * @constant
 */
module.exports.EVENT_OPENED = Symbol();

/**
 * Indicates that the device has signaled a ready state.
 * @constant
 */
module.exports.EVENT_READY = Symbol();

/**
 * Indicates a drive count report from the device.
 * @constant
 */
module.exports.EVENT_DRIVE_COUNT = Symbol();

/**
 * Indicates that the connection with the device was closed.
 * @constant
 */
module.exports.EVENT_CLOSED = Symbol();

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
