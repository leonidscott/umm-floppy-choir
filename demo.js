'use strict';

var ARDUINO = process.env.ARDUINO;

var fs = require('fs'),
    FloppyController = require('./lib/floppyController'),
    MIDIParser = require('./lib/midiParser'),
    Player = require('./lib/player');

fs.readFile('./music/Jon Batiste - Humanism.midi', function(error, data) {
  var changes = MIDIParser.parse(data);
  var controller = new FloppyController(ARDUINO);
  var player = new Player(controller);

  console.log(changes);

  player.loadChanges(changes);

  controller.once('ready', function() {
    player.play();
  });
});
