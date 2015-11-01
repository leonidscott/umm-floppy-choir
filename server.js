'use strict';


// Grab important stuff from the environment:

var ARDUINO = process.env.ARDUINO;
var PORT = process.env.PORT || 56267;


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
app.get('/getDriveCount', function(req, res) {
  res.send(JSON.stringify({driveCount: 4}));
})

io.on('connection', function(socket) {
  socket.on('set frequency', function(drive, frequency) {
    controller.setFrequency(drive - 1, frequency);
  });



  socket.on('set note', function(drive, note, accidental, octave) {

    controller.setNote(drive - 1, note, accidental, octave);
    socket.broadcast.emit('note changed', drive, note, accidental, octave)
  });
});

server.listen(PORT, function() {
  console.info('Server listening on port %d.', PORT);
});
