'use strict';

var music = module.require('./music');

/**
* An object that internally maps deltas to frequency changes on drives.
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
 * An object that represents a note in a song. Returned by the parsers and read
 * by the player.
 *
 * @typedef NoteHash
 * @type {Object}
 *
 * @property {number} voice
 *   The voice to which the note belongs.
 * @property {string} note
 *   The note name (e.g. 'A').
 * @property {number} accidental
 *   The applied accidental (music.FLAT, music.NATURAL, etc.). This can also be
 *   used as +/- half steps.
 * @param {number} octave
 *   The octave number. (Octaves begin on C; C4 is middle C.)
 * @property {number} delta
 *   The position of the note relative to time 0 (ms).
 * @property {number} duration
 *   The length of the note (ms).
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
var Player = module.exports = function(controller) {
  this.controller = controller;
};

/**
 * The currently loaded changes.
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
 * @type {number[]}
 */
Player.prototype.deltas = [];

/**
 * Starts scheduling changes at the provided delta index.
 *
 * @private
 *
 * @param {number} index
 *   The index of the starting delta.
 */
Player.prototype.fire = function(index) {
  var self = this;

  // Just to make this cleaner:
  var changes = this.changes[this.deltas[index]];

  for (var drive in changes) {
    this.controller.setFrequency(drive, changes[drive]);
  }

  if (typeof this.deltas[index + 1] !== 'undefined') {
    setTimeout(function() {
      // @TODO adjust for drift, possibly related to pausing/stopping in that
      // we'll have to keep track of time somewhere
      //
      // @see http://www.sitepoint.com/creating-accurate-timers-in-javascript/
      self.fire(index + 1);
    }, this.deltas[index + 1] - this.deltas[index]);
  }
};

/**
 * Prepares a song to be played.
 *
 * This method makes some assumptions about the data being read in, namely that
 * notes in a voice will appear in the order that they're supposed to be played.
 *
 * @param {Array.<NoteHash>} notes
 *   The notes in the song.
 */
Player.prototype.load = function(notes) {
  var changes = {};

  // @TODO investigate doing this in a non-blocking fashion
  notes.forEach(function(note) {
    var start = note.delta;
    var end = note.delta + note.duration;

    if (!changes[start])
      changes[start] = {};

    if (!changes[end])
      changes[end] = {};

    // @TODO get number of drives from controller and duplicate voices to fill
    // as many drives as possible

    changes[start][note.voice] = music.toFrequency(
      note.note, note.accidental, note.octave
    );

    changes[end][note.voice] = 0;
  });

  this.setChanges(changes);
};

/**
 * Starts playing the song on the controller.
 */
Player.prototype.play = function() {
  // @TODO write in pausing and stopping

  this.fire(0);
};

/**
 * Sets a change map and populates the delta set.
 *
 * @private
 *
 * @param {ChangeMap} changes
 *   The changes to load.
 */
Player.prototype.setChanges = function(changes) {
  this.deltas = Object.keys(changes).map(Number).sort(function(a, b) {
    // This is ridiculous.
    return a - b;
  });

  this.changes = changes;
};
