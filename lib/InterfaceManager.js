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
   * The state of the interface.
   */
  var state = {
    active: false,
    drives: []
  };

  Observer(state).on('change', console.log);

  /**
   * Connects the interface to a drive on the specified port.
   *
   * @param {string} port
   *   The path to the port (e.g. 'COM1', '/dev/tty0').
   */
  this.bind = function(port) {
    var fc = new FloppyController(port);

    fc.on(FloppyController.EVENT_DRIVE_COUNT, function(count) {
      state.drives.splice(count, state.drives.length);

      for (var i = 0; i < count; i++) {
        if (typeof state.drives[i] === 'undefined') {
          state.drives.push({
            number: i,
            note: null,
            accidental: music.NATURAL,
            octave: 3,
            playing: false
          });
        }
      }
    });

    controller = fc;
  };

};
