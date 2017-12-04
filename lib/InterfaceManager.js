'use strict';

const FloppyController = require('./FloppyController');
const Library = require('./Library');
const Player = require('./Player');

const music = require('./music');

module.exports = class InterfaceManager {

  /**
   * Creates an interface manager.
   *
   * @class
   * @classdesc
   * A monolithic supervisor that ties the various control components together.
   * Routes commands from the interface and pushes information to connected
   * sockets.
   */
  constructor() {
    this._controller = null;
    this._library = new Library();
    this._player = null;
    this._socket = null;

    // Initial state:
    this._state = {
      active: false,
      drives: [],
      paused: false,
      playing: null,
      songs: []
    };
  }

  /**
   * Connects the interface to a drive on the specified port.
   *
   * @param {string} port
   * The path to the port (e.g. 'COM1', '/dev/tty0').
   */
  attachDevice(port) {
    this._controller = new FloppyController(port)
      .on(FloppyController.EVENT_DRIVE_COUNT, count => {
        const drives = this._state.drives;
        drives.length = count;

        for (let index = 0; index < count; index++) {
          drives[index] = {
            accidental: music.NATURAL,
            note: null,
            number: index,
            octave: 3,
            playing: false
          }
        }
      });

    this._player = new Player(this._controller)
      .on(Player.EVENT_PAUSE, () => {
        this._state.paused = true;
        this._publish();
      })
      .on(Player.EVENT_PLAY, () => {
        this._state.paused = false;
        this._publish();
      });
  }

  /**
   * Connects the interface to a socket.io instance.
   *
   * @param {Server} server
   * The socket.io instance.
   */
  attachSocket(server) {
    this._socket = server.on('connection', client => {
      client.emit('set state', this._state);

      client.on('set note', (drive, note, accidental, octave) => {
        drive = this._state.drives[drive];

        if (typeof drive === 'undefined')
          return;

        if (!note) {
          this._controller.setFrequency(drive.number, drive.note, 0);

          drive.playing = false;
        }
        else {
          this._controller.setNote(drive.number, note, accidental, octave);

          drive.accidental = accidental;
          drive.octave = octave;
          drive.playing = true;
        }

        this._publish();
      });

      client.on('queue', id => {
        if (!this._player)
          return;

        // @TODO handle errors
        const song = library.get(id);

        this._player.once(Player.EVENT_LOAD, () => {
          this._player.play();

          this._state.playing = {
            id: id,
            name: song.name
          };
        });

        // @TODO make this actually queue?
        this._player.load(song.changes);
      });

      client.on('play', () => {
          return;

        player.play();
      });

      client.on('pause', () => {
        if (!player)
          return;

        player.pause();
      });

      client.on('stop', () => {
        if (!player)
          return;

        player.stop();
      });
    });
  }

  /**
   * Reads songs from a directory into the jukebox.
   *
   * @param {string} directory
   * The path to the music files.
   */
  openLibrary(directory) {
    this._library.scan(directory).then(songs => {
      this._state.songs = songs;
      this._publish();
    });
  }

  /**
   * Publishes the current state to all connected clients.
   * @private
   */
  _publish() {
    if (this._socket === null)
      return;

    this._socket.emit('set state', this._state);
  }

};
