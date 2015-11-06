'use strict';

angular.module('app').controller('FreePlayController', function($scope, socket) {
  $scope.drives = [];
  $scope.notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  socket.emit('get drive count');

  socket.on('drive count', function(count) {
    $scope.drives.splice(count, $scope.drives.length);

    for (var i = 0; i < count; i++) {
      if (typeof $scope.drives[i] === 'undefined') {
        $scope.drives[i] = {
          number: i,
          note: 'A',
          flat: false,
          sharp: false,
          octave: 3,
          playing: false
        };
      }
    }
  });

  //for testing purposes
  $scope.drives = [{
          number: 0,
          note: 'A',
          flat: false,
          sharp: false,
          octave: 3,
          playing: false
        },
        {
          number: 1,
          note: 'A',
          flat: false,
          sharp: false,
          octave: 3,
          playing: false
        },
        {
          number: 0,
          note: 'A',
          flat: false,
          sharp: false,
          octave: 3,
          playing: false
        },
        {
          number: 0,
          note: 'A',
          flat: false,
          sharp: false,
          octave: 3,
          playing: false
        }
      ]

  socket.on('note changed', function(drive, note, accidental, octave) {
    $scope.drives[drive].note = note;
    $scope.drives[drive].flat = (accidental === -1);
    $scope.drives[drive].sharp = (accidental === 1);
    $scope.drives[drive].octave = octave;
    $scope.drives[drive].playing = false;
  });

  $scope.play = function(drive, note) {
    var accidental = 0;

    if (drive.flat) accidental = -1;
    if (drive.sharp) accidental = 1;

    drive.note = note;
    drive.playing = true;

    socket.emit('set note', drive.number, drive.note, accidental, 3);
  };

  $scope.stop = function(drive) {
    if (drive.playing) {
      drive.playing = false;

      socket.emit('set frequency', drive.number, 0);
    }
  };
});