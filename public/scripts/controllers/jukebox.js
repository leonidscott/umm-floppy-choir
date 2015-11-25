'use strict';

angular.module('app').controller('JukeboxController', function($scope, socket) {
	$scope.playing = null;
	$scope.songs = {};
	$scope.showPause = true;
	$scope.nothingIsPlaying = true;

//Fetch song list, load songs after response
  socket.emit('get song list');

	socket.on('song list', function(songs) {
		$scope.songs = songs;
	});

//Means by which a user interacts with the page
	$scope.start = function(id) {
		socket.emit('start song', id);
		$scope.showPause = true;
	};

	//Unused, not sure if backend is actually implemented
	// $scope.stop = function() {
	// 	socket.emit('stop');
	// };

	$scope.switchPauseOrPlay = function() {
		if($scope.showPause) { //if pause is clicked...
			$scope.pause();
		} else {
			$scope.play();
		}
	}

	$scope.play = function() {
		socket.emit('play');
		$scope.showPause = true;
	};

	$scope.pause = function() {
		socket.emit('pause');
		$scope.showPause = false;
	};

//Recieved from server as a result of other user's interations
	socket.on('song changed', function(song) {
		$scope.playing = song;
		$scope.showPause = true;
	});

	socket.on('song paused', function() {
		$scope.showPause = false;
	})

	socket.on('song played', function() {
		$scope.showPause = true;
	})

});
