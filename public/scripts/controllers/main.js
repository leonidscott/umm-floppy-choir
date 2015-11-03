'use strict';

angular.module('app').config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$routeProvider.when('/jukebox', {
		templateUrl: 'partials/jukebox.html',
		controller: 'JukeboxController'
	}).when('/free-play', {
		templateUrl: 'partials/free-play.html',
		controller: 'FreePlayController'
	}).otherwise({
		redirectTo: '/jukebox'
	});
}]).controller('MainController', function($scope, $location) {
	$scope.displays = [
		{
			label: 'Jukebox',
			route: '#/jukebox'
		},
		{
			label: 'Free play',
			route: '#/free-play'
		}
	];

	$scope.isActive = function(path) {
		return path === $location.path();
	};
});
