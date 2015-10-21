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
    socket = require('socket.io');

var app = express(),
    server = http.Server(app),
    io = socket(server);
var bodyParser     =        require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/setFrequency', function(req, res) {
	// controller.setFrequency(req.param.frequency);
	res.send('Done: ' + req.param('freq'));
});

app.use(express.static('public'));

server.listen(PORT, function() {
  console.info('Server listening on port %d.', PORT);
});
