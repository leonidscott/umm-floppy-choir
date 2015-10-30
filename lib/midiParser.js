'use strict';

var MIDIEvents = require('midievents'),
    MIDIFile = require('midifile'),
    music = module.require('./music');

var MIDIParser = module.exports = {
  parse: function(buffer) {
    var buffer = new Uint8Array(buffer).buffer;
    var midi = new MIDIFile(buffer);

    var events = midi.getMidiEvents();
    var output = {};

    for (var i in events) {
      var e = events[i];

      if (e.type !== MIDIEvents.EVENT_MIDI)
        continue;

      if (e.subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF || MIDIEvents.EVENT_MIDI_NOTE_ON) {
        var delta = Math.round(e.playTime);

        if (!output[delta])
          output[delta] = {};

        // Everything is bumped down by two octaves (24 half steps) to fit the
        // drive range.
        output[delta][e.channel] = e.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON ?
          music.midiToFrequency(e.param1 - 24) : 0;
      }
    }

    return output;
  }
};
