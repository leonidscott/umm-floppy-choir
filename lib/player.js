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
 * Convenience function to get the current high-resolution time.
 *
 * @return {number}
 *   High-resolution time (ms) relative to some point in the past.
 */
var microtime = function() {
  var hrt = process.hrtime();

  return (hrt[0] * 1000) + hrt[1] / 1000000;
};

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
var Player = module.exports = function(controller) {
  this.controller = controller;
};

/**
 * The currently loaded changes.
 * @private
 * @type {ChangeMap}
 */
Player.prototype.changes = {};

/**
 * The controller to play on.
 * @type {FloppyController}
 */
Player.prototype.controller = null;

/**
 * An ordered set of all change deltas.
 * @private
 * @type {number[]}
 */
Player.prototype.deltas = [];

/**
 * Dictionary of state information.
 * @private
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
Player.prototype.state = {
  delta: 0,
  fired: 0,
  offset: 0,
  playing: false,
  timeout: 0
};

/**
 * Starts scheduling changes at the provided delta index.
 *
 * @private
 *
 * @param {number} delta
 *   The index of the starting delta.
 * @param {number} offset
 *   The time (in ms) to remove from the current delta (used to avoid timeout
 *   drift and to resume from the correct point).
 */
Player.prototype.fire = function(delta, offset) {
  var self = this;

  // Just to make this cleaner:
  var changes = this.changes[this.deltas[delta]];

  for (var drive in changes) {
    this.controller.setFrequency(drive, changes[drive]);
  }

  this.state.delta = delta;
  this.state.fired = microtime();

  if (typeof this.deltas[delta + 1] !== 'undefined') {
    this.state.timeout = setTimeout(function() {
      // @TODO add drift correction here
      self.fire(delta + 1, 0);
    }, this.deltas[delta + 1] - this.deltas[delta] - offset);
  }
};

/**
 * Loads a song from a map of frequency changes.
 *
 * @param {ChangeMap} changes
 *   The changes to load.
 */
Player.prototype.load = function(changes) {
  this.stop();

  this.deltas = Object.keys(changes).map(Number).sort(function(a, b) {
    // This is ridiculous.
    return a - b;
  });

  this.changes = changes;
};

/**
 * Silences the drives and sets the playback state so that the song can be
 * resumed later.
 */
Player.prototype.pause = function() {
  if (!this.state.playing)
    return;

  this.controller.silence();
  this.state.playing = false;

  // Stop the firing chain.
  clearTimeout(this.state.timeout);

  // Set a resume offset.
  this.state.offset = microtime() - this.state.fired;
};

/**
 * Starts playing the currently loaded song on the controller.
 */
Player.prototype.play = function() {
  if (this.state.playing)
    return;

  this.state.playing = true;

  this.fire(this.state.delta, this.state.offset);
};

/**
 * Stops playback of the current song if necessary and resets the playback time.
 */
Player.prototype.stop = function() {
  // Stops playback and silences the drives.
  this.pause();

  // Resets the playback state.
  this.state = {
    delta: 0,
    fired: 0,
    offset: 0,
    playing: false,
    timeout: 0
  };
};
