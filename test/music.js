var assert = require('assert'),
    music = require('../lib/music');

describe('music', function() {
  describe('.pitchToFrequency(note, accidental, octave)', function() {
    it('correctly converts notes to pitches', function() {
      assert.equal(Math.round(music.pitchToFrequency('A', music.NATURAL, 4)), 440);
      assert.equal(Math.round(music.pitchToFrequency('A', music.NATURAL, 0)), 27);

      assert.equal(Math.round(music.pitchToFrequency('D', music.FLAT, 2)), 69);
      assert.equal(Math.round(music.pitchToFrequency('F', music.SHARP, 3)), 185);
      assert.equal(Math.round(music.pitchToFrequency('G', music.DOUBLE_FLAT, 1)), 44);
      assert.equal(Math.round(music.pitchToFrequency('G', music.DOUBLE_SHARP, 1)), 55);
    });

    it('accepts both uppercase and lowercase pitch names', function() {
      assert.equal(Math.round(music.pitchToFrequency('a', music.NATURAL, 4)), 440);
    });

    it('accepts half steps as well as accidental constants', function() {
      assert.equal(Math.round(music.pitchToFrequency('A', -12, 3)), 110);
      assert.equal(Math.round(music.pitchToFrequency('A', 12, 3)), 440);
    });

    it('complains about invalid notes', function() {
      assert.throws(function() {
        music.pitchToFrequency('H', music.NATURAL, 4);
      }, RangeError);
    });
  });
});
