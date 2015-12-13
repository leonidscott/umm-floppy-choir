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

	socket.on('set scope', function(scope) {
		for (var key in scope) {
			$scope[key] = scope[key];
		}
	});

	socket.on('update scope', function(path, value) {
		var components = path.split('.');
		var property = components.pop();

		var context = $scope;

		for (var i = 0, key; context && (key = components[i]); i++) {
			if (!(key in context)) {
				context[key] = {};
			}

			context = context[key];
		}

		context[property] = value;
	});
});
