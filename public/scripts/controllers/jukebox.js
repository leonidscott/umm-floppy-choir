'use strict';

angular.module('app').controller('JukeboxController', function($scope, socket) {
	$scope.playing = null;
	$scope.songs = {};
	$scope.showPause = false;
	$scope.nothingIsPlaying = true;

  socket.emit('get song list');

	socket.on('song list', function(songs) {
		$scope.songs = songs;
	});

	socket.on('song changed', function(song) {
		$scope.playing = song;
		$scope.showPause = false;
	});

	socket.on('song paused', function() {
		$scope.showPause = true;
	})

	socket.on('song played', function() {
		$scope.showPause = false;
	})

	$scope.start = function(id) {
		socket.emit('start song', id);
		$scope.showPause = false;
	};

	$scope.play = function() {
		socket.emit('play');
		$scope.showPause = false;
	};

	$scope.pause = function() {
		socket.emit('pause');
	};

	$scope.stop = function() {
		socket.emit('stop');
	};

	$scope.switchPauseOrPlay = function() {
		if($scope.showPause) {
			$scope.play();
		} else {
			$scope.pause();
		}
	}
});
