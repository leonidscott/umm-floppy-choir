'use strict';

angular.module('app').controller('MainController', function($scope, socket, $http) {
	$scope.note = 'A';
	$scope.flat = false;
	$scope.sharp = false;
	$scope.driveCount = 0;
	$scope.drives = []
	$scope.start = function(drive) {
		var accidental = 0;

		if (drive.flat) accidental = -1;
		if (drive.sharp) accidental = 1;

		socket.emit('set note', drive.driveCount, drive.note, accidental, 3);
		drive.playing = true;
		console.log(drive.playing)
	};

	$scope.stop = function(drive) {
		console.log('stop');
		socket.emit('set frequency', drive.driveCount, 0);

	};

	socket.on('note changed', function(drive, note, accidental, octave) {
		$scope.drives[drive - 1].playing = false;
		$scope.drives[drive - 1].note = note;
		$scope.drives[drive - 1].flat = (accidental == -1);
		$scope.drives[drive - 1].flat = (accidental == 1);
		$scope.drives[drive - 1].octave = octave
	})

	$scope.playNote = function(drive, note) {
		drive.note = note;
		console.log('start');
		$scope.start(drive);
	}

	$scope.stopNote = function(drive, note) {
		if(drive.playing) {
			drive.playing = false
			$scope.stop(drive);
		}
	}

	$scope.getDriveCount = function() {
		$http.get('http://localhost:56267/getDriveCount').success( function(success) {
			console.log(success.driveCount)
			$scope.drives = $scope.range(success.driveCount);
		})
	}

	$scope.range = function(count){

	  $scope.drives = []; 

	  for (var i = 0; i < count; i++) { 
	    $scope.drives.push({driveCount: i + 1, note: 'A', flat: false, sharp: false, playing: false}) 
	  } 

	  return $scope.drives;
	}

	$scope.range(2)

	$scope.getDriveCount();
});
