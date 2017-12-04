'use strict';

const MIDIEvents = require('midievents');
const MIDIFile = require('midifile');

const music = module.require('./music');

module.exports.parse = function(buffer) {
  const buffer = new Uint8Array(buffer).buffer;
  const midi = new MIDIFile(buffer);

  return midi.getMidiEvents()
    .filter(event => event.type === MIDIEvents.EVENT_MIDI)
    .filter(event => event.subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF || event.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON)
    .reduce((output, event) => {
      const delta = Math.round(event.playTime);

      if (!output[delta])
        output[delta] = {};

      // Everything is bumped down by two octaves (24 half steps) to fit the
      // drive range.
      output[delta][event.channel] = event.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON
        ? music.midiToFrequency(event.param1 - 24)
        : 0;

      return output;
    }, {});
};
