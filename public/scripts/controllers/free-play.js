'use strict';

angular.module('app').controller('FreePlayController', function($scope, socket) {
  $scope.notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  $scope.play = function(drive, note) {
    socket.emit('set note', drive.number, note, drive.accidental, 3);
  };

  $scope.stop = function(drive) {
    if (drive.playing) {
      socket.emit('set note', drive.number, null);
    }
  };
});
