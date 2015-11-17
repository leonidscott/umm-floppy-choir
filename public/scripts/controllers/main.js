'use strict';

angular.module('app').controller('MainController', function($scope, $location) {
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
});
