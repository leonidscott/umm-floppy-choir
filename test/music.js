var assert = require('assert'),
    music = require('../lib/music');

describe('music', function() {
  describe('.toFrequency(note, accidental, octave)', function() {
    it('correctly converts notes to pitches', function() {
      assert.equal(Math.round(music.toFrequency('A', music.NATURAL, 4)), 440);
      assert.equal(Math.round(music.toFrequency('A', music.NATURAL, 0)), 27);

      assert.equal(Math.round(music.toFrequency('D', music.FLAT, 2)), 69);
      assert.equal(Math.round(music.toFrequency('F', music.SHARP, 3)), 185);
      assert.equal(Math.round(music.toFrequency('G', music.DOUBLE_FLAT, 1)), 44);
      assert.equal(Math.round(music.toFrequency('G', music.DOUBLE_SHARP, 1)), 55);
    });

    it('accepts both uppercase and lowercase pitch names', function() {
      assert.equal(Math.round(music.toFrequency('a', music.NATURAL, 4)), 440);
    });

    it('accepts half steps as well as accidental constants', function() {
      assert.equal(Math.round(music.toFrequency('A', -12, 3)), 110);
      assert.equal(Math.round(music.toFrequency('A', 12, 3)), 440);
    });

    it('complains about invalid notes', function() {
      assert.throws(function() {
        music.toFrequency('H', music.NATURAL, 4);
      }, RangeError);
    });
  });
});
