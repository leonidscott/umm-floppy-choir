'use strict';

angular.module('app').controller('MainController', function($scope, socket) {
	$scope.note = 'A';
	$scope.flat = false;
	$scope.sharp = false;

	$scope.start = function() {
		var accidental = 0;

		if ($scope.flat) accidental = -1;
		if ($scope.sharp) accidental = 1;

		socket.emit('set note', 0, $scope.note, accidental, 3);
	};

	$scope.stop = function() {
		socket.emit('set frequency', 0, 0);
	};
});
