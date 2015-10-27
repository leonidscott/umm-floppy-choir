'use strict';

/**
 * An object that internally represents a frequency change.
 *
 * @typedef ChangeHash
 * @type {object}
 *
 * @property {number} drive
 *   The number of the drive to be changed.
 * @property {number} frequency
 *   The change frequency. 0 silences the drive.
 */

/**
 * An object that represents a note in a song. Returned by the parsers and read
 * by the player.
 *
 * @typedef NoteHash
 * @type {object}
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
 * An object that maps deltas to changes.
 *
 * @typedef QueueHash
 * @type {object}
 *
 * @property {number} delta
 *   The position of the changes relative to time 0 (ms).
 * @property {ChangeHash[]}
 *   The changes for the key delta.
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
 * The currently loaded changes.
 * @type {QueueHash}
 */
Player.prototype.queue = {};

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

  this.queue[this.deltas[index]].forEach(function(change) {
    self.controller.setFrequency(change.drive, change.frequency);
  });

  if (typeof this.deltas[index + 1] !== 'undefined') {
    setTimeout(function() {
      self.fire(index + 1);
    }, this.deltas[index + 1] - this.deltas[index]);
  }
};

/**
 * Prepares a song to be played.
 *
 * @param {Array.<NoteHash>} notes
 *   The notes in the song.
 */
Player.prototype.load = function(notes) {
  var queue = {};

  notes.forEach(function(note) {
    var start = note.delta;
    var end = note.delta + note.duration;

    // @todo actually add stuff to the queue
  });

  this.setQueue(queue);
};

/**
 * Starts playing the song on the controller.
 */
Player.prototype.play = function() {
  // @TODO write in pausing and stopping

  this.fire(0);
};

/**
 * Populates the change delta set.
 *
 * @private
 *
 * @param {ChangeHash[]}
 *   The changes to load.
 */
Player.prototype.setQueue = function(queue) {
  this.deltas = Object.keys(queue).sort();
  this.queue = queue;
};
