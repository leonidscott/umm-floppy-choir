'use strict';

var Observer = require('observed'),
    FloppyController = require('./FloppyController'),
    Library = require('./Library'),
    Player = require('./Player'),
    music = require('./music');

/**
 * Creates an interface manager.
 *
 * @class
 * @classdesc
 *   A monolithic supervisor that ties the various control components together.
 *   Routes commands from the interface and pushes information to connected
 *   sockets.
 */
module.exports = function() {

  /**
   * The controller providing the drives for the interface.
   */
  var controller = null;

  /**
   * The socket.io instance.
   */
  var io = null;

  /**
   * The jukebox library.
   */
  var library = new Library();

  /**
   * The player.
   */
  var player = null;

  /**
   * The global Angular scope, synchronized across clients.
   */
  var scope = {
    active: false,
    drives: [],
    paused: false,
    playing: null,
    songs: []
  };

  /**
   * Connects the interface to a drive on the specified port.
   *
   * @param {string} port
   *   The path to the port (e.g. 'COM1', '/dev/tty0').
   */
  this.attachDevice = function(port) {
    controller = new FloppyController(port).on(FloppyController.EVENT_DRIVE_COUNT, function(count) {
      scope.drives.length = count;

      for (var i = 0; i < count; i++) {
        if (typeof scope.drives[i] === 'undefined') {
          scope.drives[i] = {
            number: i,
            note: null,
            accidental: music.NATURAL,
            octave: 3,
            playing: false
          };
        }
      }
    });

    player = new Player(controller);

    player.on(Player.EVENT_PAUSE, function() {
      scope.paused = true;
    });

    player.on(Player.EVENT_PLAY, function() {
      scope.paused = false;
    });
  };

  /**
   * Connects the interface to a socket.io instance.
   *
   * @param {Server} server
   *   The socket.io instance.
   */
  this.attachSocket = function(server) {
    io = server.on('connection', function(client) {
      client.emit('set scope', scope);

      client.on('set note', function(drive, note, accidental, octave) {
        if (typeof scope.drives[drive] === 'undefined') {
          return;
        }

        if (note === null) {
          controller.setFrequency(drive, 0);

          scope.drives[drive].note = null;
          scope.drives[drive].playing = false;
        }
        else {
          controller.setNote(drive, note, accidental, octave);

          scope.drives[drive].note = note;
          scope.drives[drive].accidental = accidental;
          scope.drives[drive].octave = octave;
          scope.drives[drive].playing = true;
        }
      });

      client.on('queue', function(id) {
        if (!player) {
          return;
        }

        // @TODO handle errors
        var song = library.get(id);

        player.once(Player.EVENT_LOAD, function() {
          player.play();

          scope.playing = {
            id: id,
            name: song.name
          };
        });

        // @TODO make this actually queue?
        player.load(song.changes);
      });

      client.on('play', function() {
        if (!player) {
          return;
        }

        player.play();
      });

      client.on('pause', function() {
        if (!player) {
          return;
        }

        player.pause();
      });

      client.on('stop', function() {
        if (!player) {
          return;
        }

        player.stop();
      });

    });
  };

  /**
   * Reads songs from a directory into the jukebox.
   *
   * @param {string} directory
   *   The path to the music files.
   */
  this.openLibrary = function(directory) {
    library.ingest(directory).then(function(songs) {
      scope.songs = songs;
    });
  };

  // Push changes to the scope to all connected clients:
  Observer(scope).on('change', function(change) {
    if (typeof io === 'undefined') {
      return;
    }

    io.emit('update scope', change.path, change.value);
  });

};
