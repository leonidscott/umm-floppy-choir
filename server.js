'use strict';

var PORT = process.env.PORT || 3333;

var express = require('express'),
    http = require('http'),
    socket = require('socket.io');

var app = express(),
    server = http.Server(app),
    io = socket(server);

app.use(express.static('public'));

server.listen(PORT, function() {
  console.info('Server listening on port %d!', PORT);
});

io.on('connection', function(socket) {
  socket.emit('log', 'Connection established.');
});
