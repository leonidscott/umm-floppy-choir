'use strict';

var music = module.require('./music');

/**
* Internally maps deltas to frequency changes on drives.
*
* @example
* // at time 1200ms, set drive 0 to A3 and silence drive 1
* {
*   1200: {
*     0: 220,
*     1: 0
*   }
* }
*
* @typedef ChangeMap
* @type {Object.<number, Object.<number, number>>}
*/

/**
 * Initializes the player.
 *
 * @class
 * @classdesc
 *   A music player that reads in note events and plays them on a controller.
 *
 * @param {FloppyController} controller
 *   The controller to play on.
 */
module.exports = function(controller) {

  /**
   * The currently loaded changes.
   * @type {ChangeMap}
   */
  var changes = {};

  /**
   * An ordered set of all change deltas.
   * @type {number[]}
   */
  var deltas = [];

  /**
   * Dictionary of state information.
   * @type {object}
   * @property {number} delta
   *   The index of the last fired change delta.
   * @property {number} fired
   *   The relative time when the last delta was fired.
   * @property {number} offset
   *   The relative time elapsed from when the last delta was fired to when the
   *   player was stopped (i.e. how far into the delta to resume).
   * @property {boolean} playing
   *   Whether a song is currently playing.
   * @property {number} timeout
   *   The numerical timeout ID.
   */
  var state = {
    delta: 0,
    fired: 0,
    offset: 0,
    playing: false,
    timeout: 0
  };

  /**
   * Starts scheduling changes at the provided delta index.
   *
   * @param {number} delta
   *   The index of the starting delta.
   * @param {number} offset
   *   The time (in ms) to remove from the current delta (used to avoid timeout
   *   drift and to resume from the correct point).
   */
  var fire = function(delta, offset) {
    // Just to make this cleaner:
    var c = changes[deltas[delta]];

    for (var drive in c) {
      controller.setFrequency(drive, c[drive]);
    }

    state.delta = delta;
    state.fired = microtime();

    if (typeof deltas[delta + 1] !== 'undefined') {
      state.timeout = setTimeout(function() {
        // @TODO add drift correction
        fire(delta + 1, 0);
      }, deltas[delta + 1] - deltas[delta] - offset);
    }
  };

  /**
   * Gets the current high-resolution time.
   *
   * @return {number}
   *   High-resolution time (ms) relative to some point in the past.
   */
  var microtime = function() {
    var hrt = process.hrtime();

    return (hrt[0] * 1000) + hrt[1] / 1000000;
  };

  /**
   * Loads a song from a map of frequency changes.
   *
   * @param {ChangeMap} map
   *   The changes to load.
   */
  var load = this.load = function(map) {
    stop();

    deltas = Object.keys(map).map(Number).sort(function(a, b) {
      // This is ridiculous.
      return a - b;
    });

    changes = map;
  };

  /**
   * Silences the drives and sets the playback state so that the song can be
   * resumed later.
   */
  var pause = this.pause = function() {
    if (!state.playing) {
      return;
    }

    controller.silence();
    state.playing = false;

    // Stop the firing chain.
    clearTimeout(state.timeout);

    // Set a resume offset.
    state.offset = microtime() - state.fired;
  };

  /**
   * Starts playing the currently loaded song on the controller.
   */
  var play = this.play = function() {
    if (state.playing) {
      return;
    }

    state.playing = true;

    fire(state.delta, state.offset);
  };

  /**
   * Stops playback of the current song if necessary and resets the playback time.
   */
  var stop = this.stop = function() {
    // Stops playback and silences the drives.
    pause();

    // Resets the playback state.
    state = {
      delta: 0,
      fired: 0,
      offset: 0,
      playing: false,
      timeout: 0
    };
  };

};
