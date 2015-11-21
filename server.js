'use strict';


// Grab important stuff from the environment:

var ARDUINO = process.env.ARDUINO;
var PORT = process.env.PORT || 56267;

if (!ARDUINO)
  console.warn('Serial port not specified! Controller events will be written to the console.');


// Connect the controller to the device:

var FloppyController = require('./lib/floppyController');

var controller = new FloppyController(ARDUINO);


// Set up the music library and the player:

var Library = require('./lib/library'),
    Player = require('./lib/player');

var library = new Library(__dirname + '/music'),
    player = new Player(controller);


// Start the web interface and handle events:

var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    socketio = require('socket.io');

var app = express(),
    server = http.Server(app),
    io = socketio(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  socket.on('get drive count', function() {
    var driveCount = controller.getDriveCount();
    console.info('%d floppy drives have been attached.', driveCount);
    socket.emit('drive count', driveCount);
  });

  socket.on('get song list', function() {
    // @TODO this could fail... the library needs some getter function that
    // makes sure the index is built
    socket.emit('song list', library.files);
  });

  socket.on('set frequency', function(drive, frequency) {
    controller.setFrequency(drive, frequency);
    socket.broadcast.emit('frequency changed', drive, frequency);
  });

  socket.on('set note', function(drive, note, accidental, octave) {
    controller.setNote(drive, note, accidental, octave);
    socket.broadcast.emit('note changed', drive, note, accidental, octave)
  });

  socket.on('start song', function(id) {
    // @TODO this could fail, see above
    if (!(id in library.files)) {
      socket.emit('error', 'Requested song does not exist.');
    }

    var file = library.files[id];

    library.readFile(id).then(function(data) {
      player.load(file.parser.parse(data));
      player.play();

      io.emit('song changed', file);
    });
  });

  socket.on('play', function() {
    player.play();
    io.emit('song played');
  });

  socket.on('pause', function() {
    player.pause();
    io.emit('song paused');
  });

  socket.on('stop', function() {
    player.stop();

    io.emit('song changed', null)
  });

});

server.listen(PORT, function() {
  console.info('Server listening on port %d.', PORT);
});
