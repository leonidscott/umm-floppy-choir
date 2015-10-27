var assert = require('assert'),
    music = require('../lib/music'),
    Player = require('../lib/player');

describe('Player', function() {
  describe('#load(notes)', function() {
    it('correctly converts note hashes to change hashes', function() {
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
        0: [
          {
            drive: 0,
            frequency: music.toFrequency('C', music.NATURAL, 2)
          },
          {
            drive: 1,
            frequency: music.toFrequency('E', music.NATURAL, 2)
          }
        ],
        500: [
          {
            drive: 1,
            frequency: 0
          }
        ],
        1000: [
          {
            drive: 0,
            frequency: 0
          },
          {
            drive: 0,
            frequency: music.toFrequency('D', music.NATURAL, 2)
          },
          {
            drive: 1,
            frequency: music.toFrequency('F', music.NATURAL, 2)
          }
        ],
        1500: [
          {
            drive: 1,
            frequency: 0
          }
        ],
        2000: [
          {
            drive: 0,
            frequency: 0
          },
          {
            drive: 0,
            frequency: music.toFrequency('E', music.NATURAL, 2)
          },
          {
            drive: 1,
            frequency: music.toFrequency('G', music.NATURAL, 2)
          }
        ],
        2500: [
          {
            drive: 1,
            frequency: 0
          }
        ],
        3000: [
          {
            drive: 0,
            frequency: 0
          }
        ]
      };

      var deltas = [0, 500, 1000, 1500, 2000, 2500, 3000];

      p.load(notes);

      assert.deepEqual(p.deltas, deltas);
      assert.deepEqual(p.queue, changes);
    });
  });
});
