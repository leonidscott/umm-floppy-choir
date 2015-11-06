'use strict';


// Grab important stuff from the environment:

var ARDUINO = process.env.ARDUINO;
var PORT = process.env.PORT || 56267;

if (!ARDUINO)
  console.warn('Serial port not specified! Controller events will be written to the console.');


// Connect the controller to the device:

var FloppyController = require('./lib/floppyController');

var controller = new FloppyController(ARDUINO);


// Start the web interface and handle events:

var express = require('express'),
    http = require('http'),
    socketio = require('socket.io');

var app = express(),
    server = http.Server(app),
    io = socketio(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  socket.on('get drive count', function() {
    controller.getDriveCount().then(function(count) {
      socket.emit('drive count', count);
    });
  });

  socket.on('set frequency', function(drive, frequency) {
    controller.setFrequency(drive, frequency);
    socket.broadcast.emit('frequency changed', drive, frequency);
  });

  socket.on('set note', function(drive, note, accidental, octave) {
    controller.setNote(drive, note, accidental, octave);
    socket.broadcast.emit('note changed', drive, note, accidental, octave)
  });

  socket.on('play song', function(songName) {
    //call controller.playSong or something like that
  });

  socket.on('stop playing song', function() {
    //call controller.stopSong or something like that
  });

});

server.listen(PORT, function() {
  console.info('Server listening on port %d.', PORT);
});
