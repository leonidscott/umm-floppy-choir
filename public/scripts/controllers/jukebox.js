'use strict';

angular.module('app').controller('JukeboxController', function($scope, socket) {

	$scope.queue = function(id) {
		socket.emit('queue', id);
		$scope.showPause = true;
	};

	$scope.stop = function() {
	  socket.emit('stop');
	};

	$scope.play = function() {
		socket.emit('play');
	};

	$scope.pause = function() {
		socket.emit('pause');
	};

});
