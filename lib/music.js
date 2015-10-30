'use strict';

/**
 * Collection of music utilities.
 *
 * @module
 */

/**
 * @constant
 */
module.exports.DOUBLE_FLAT = -2;

/**
 * @constant
 */
module.exports.FLAT = -1;

/**
 * @constant
 */
module.exports.NATURAL = 0;

/**
 * @constant
 */
module.exports.SHARP = 1;

/**
 * @constant
 */
module.exports.DOUBLE_SHARP = 2;

/**
 * Semitone distance (2^(1/12)), calculated once here.
 */
var SEMITONE = Math.pow(2, 1 / 12);

/**
 * Converts a MIDI note to a frequency.
 */
module.exports.midiToFrequency = function(note) {
  // The reference frequency:
  var a4 = 440;

  // Its MIDI note:
  var ref = 69;

  return a4 * Math.pow(SEMITONE, ref - note);
};

/**
 * Converts a pitch to a frequency.
 *
 * @example
 * music.pitchToFrequency('A', music.NATURAL, 4);
 * // 440
 * music.pitchToFrequency('A', 0, 4);
 * // 440
 * music.pitchToFrequency('E', music.FLAT, 2);
 * // 77.78...
 * music.pitchToFrequency('E', 5, 4);
 * // 440
 *
 * @param {string} note
 *   The note name (e.g. 'A').
 * @param {number} accidental
 *   The applied accidental (music.FLAT, music.NATURAL, etc.). This can also be
 *   used as +/- half steps.
 * @param {number} octave
 *   The octave number. (Octaves begin on C; C4 is middle C.)
 *
 * @returns {number}
 *   The frequency (Hz) of the pitch.
 *
 * @throws {RangeError}
 *   If the provided note isn't within A-G.
 *
 * @see https://en.wikipedia.org/wiki/Scientific_pitch_notation
 */
module.exports.pitchToFrequency = function(note, accidental, octave) {
  // The reference frequency:
  var a4 = 440;

  // Map of the number of half steps from A:
  var table = {
    C: -9,
    D: -7,
    E: -5,
    F: -4,
    G: -2,
    A: 0,
    B: 2
  };

  note = note.toUpperCase();

  if (typeof table[note] === "undefined") {
    throw new RangeError('Note must be within A-G.');
  }

  // Calculate the distance from A4 in half steps:
  var steps = table[note] + accidental + ((octave - 4) * 12);

  return a4 * Math.pow(SEMITONE, steps);
};
