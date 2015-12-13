'use strict';

// Grab stuff from the environment:
var ARDUINO = process.env.ARDUINO;
var PORT = process.env.PORT || 56267;

var express = require('express'),
    fs = require('fs'),
    http = require('http'),
    socketio = require('socket.io'),
    InterfaceManager = require('./lib/InterfaceManager');

// Start the web server:
var app = express(),
    server = http.Server(app),
    io = socketio(server);

app.use(express.static(__dirname + '/public'));

// Set up the interface manager:
var im = new InterfaceManager();
im.attachDevice(ARDUINO);
im.attachSocket(io);

server.listen(PORT, function() {
  console.info('Server listening on port %d.', PORT);
});
