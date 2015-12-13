'use strict';

var Observer = require('observed'),
    FloppyController = require('./FloppyController'),
    music = require('./music');

/**
 * Creates an interface manager.
 *
 * @class
 * @classdesc
 *   A big, monolithic supervisor that ties the various control components
 *   together. Routes commands from the interface and pushes information to
 *   connected sockets.
 */
module.exports = function() {

  /**
   * The controller providing the drives for the interface.
   */
  var controller = null;

  /**
   * The socket.io instance.
   */
  var io = null;

  /**
   * The scope of the interface.
   */
  var scope = {
    active: false,
    drives: []
  };

  /**
   * Connects the interface to a drive on the specified port.
   *
   * @param {string} port
   *   The path to the port (e.g. 'COM1', '/dev/tty0').
   */
  this.attachDevice = function(port) {
    controller = new FloppyController(port).on(FloppyController.EVENT_DRIVE_COUNT, function(count) {
      scope.drives.length = count;

      for (var i = 0; i < count; i++) {
        if (typeof scope.drives[i] === 'undefined') {
          scope.drives[i] = {
            number: i,
            note: null,
            accidental: music.NATURAL,
            octave: 3,
            playing: false
          };
        }
      }
    });
  };

  /**
   * Connects the interface to a socket.io instance.
   *
   * @param {Server} server
   *   The socket.io instance.
   */
  this.attachSocket = function(server) {
    io = server.on('connection', function(client) {
      client.emit('set scope', scope);

      client.on('set note', function(drive, note, accidental, octave) {
        if (typeof scope.drives[drive] === 'undefined') {
          return;
        }

        if (note === null) {
          controller.setFrequency(drive, 0);

          scope.drives[drive].note = null;
          scope.drives[drive].playing = false;
        }
        else {
          controller.setNote(drive, note, accidental, octave);

          scope.drives[drive].note = note;
          scope.drives[drive].accidental = accidental;
          scope.drives[drive].octave = octave;
          scope.drives[drive].playing = true;
        }
      });

      client.on('queue song', function(id) {
        //
      });

      client.on('play', function() {

      });

      client.on('pause', function() {

      });

      client.on('stop', function() {

      });

    });
  };

  // Push changes to the scope to all connected clients:
  Observer(scope).on('change', function(change) {
    if (typeof io === 'undefined') {
      return;
    }

    io.emit('update scope', change.path, change.value);
  });

};
