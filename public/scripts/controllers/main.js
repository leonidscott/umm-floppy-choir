'use strict';

angular.module('app').controller('MainController', function($scope, $location, socket) {
	$scope.displays = [
		{
			label: 'Jukebox',
			route: '/jukebox'
		},
		{
			label: 'Free play',
			route: '/free-play'
		}
	];

	$scope.menu = false;

	$scope.isActive = function(display) {
		return display.route === $location.path();
	};

	socket.on('set state', function(state) {
		Object.assign($scope, state);
	});
});
