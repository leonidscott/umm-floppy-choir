'use strict';

/**
 * The floppy drive controller interface. Expects to communicate with
 * a device according to the specification outlined in the project
 * wiki.
 */

var SerialPort = require('serialport').SerialPort;

/**
 * Initializes the controller.
 *
 * @constructor
 * @param {string} port
 *   The serial interface (e.g. '/dev/tty0').
 */
var FloppyController = function(port) {
  // Connect to the device and attempt to open the connection
  // immediately:
  this.serial = new SerialPort(port, {
    baudrate: 9600,
  }, true).on('open', function(error) {
    console.log('opened!');
  }).on('close', function(error) {
    console.log('closed');
  }).on('error', function(error) {
    // fail spectacularly:
    console.log(error);
  });
};

/**
 * Gets the number of active drives. This is hardcoded into the
 * Arduino control code.
 *
 * @returns {number}
 */
FloppyController.prototype.getDriveCount = function() {
  
};

module.exports = FloppyController;
