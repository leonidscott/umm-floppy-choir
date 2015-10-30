var assert = require('assert'),
    music = require('../lib/music'),
    Player = require('../lib/player');

describe('Player', function() {
  describe('#load(notes)', function() {
    it('correctly converts note hashes to a change map', function() {
      var p = new Player();

      var notes = [
        {
          voice: 0,
          note: 'C',
          accidental: music.NATURAL,
          octave: 2,
          delta: 0,
          duration: 1000
        },
        {
          voice: 1,
          note: 'E',
          accidental: music.NATURAL,
          octave: 2,
          delta: 0,
          duration: 500
        },
        {
          voice: 0,
          note: 'D',
          accidental: music.NATURAL,
          octave: 2,
          delta: 1000,
          duration: 1000
        },
        {
          voice: 1,
          note: 'F',
          accidental: music.NATURAL,
          octave: 2,
          delta: 1000,
          duration: 500
        },
        {
          voice: 0,
          note: 'E',
          accidental: music.NATURAL,
          octave: 2,
          delta: 2000,
          duration: 1000
        },
        {
          voice: 1,
          note: 'G',
          accidental: music.NATURAL,
          octave: 2,
          delta: 2000,
          duration: 500
        }
      ];

      var changes = {
        0: {
          0: music.pitchToFrequency('C', music.NATURAL, 2),
          1: music.pitchToFrequency('E', music.NATURAL, 2)
        },
        500: {
          1: 0
        },
        1000: {
          0: music.pitchToFrequency('D', music.NATURAL, 2),
          1: music.pitchToFrequency('F', music.NATURAL, 2)
        },
        1500: {
          1: 0
        },
        2000: {
          0: music.pitchToFrequency('E', music.NATURAL, 2),
          1: music.pitchToFrequency('G', music.NATURAL, 2)
        },
        2500: {
          1: 0
        },
        3000: {
          0: 0
        }
      };

      var deltas = [0, 500, 1000, 1500, 2000, 2500, 3000];

      p.load(notes);

      assert.deepEqual(p.deltas, deltas);
      assert.deepEqual(p.changes, changes);
    });
  });
});
