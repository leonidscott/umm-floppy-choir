'use strict';

var ARDUINO = process.env.ARDUINO;

var fs = require('fs'),
    FloppyController = require('./lib/floppyController'),
    Player = require('./lib/player');

var controller = new FloppyController(ARDUINO);
var player = new Player(controller);

var song = JSON.parse(fs.readFileSync('./music/under_pressure.json', 'utf8'));

player.load(song);

controller.once('ready', function() {
  player.play();
});
