'use strict';

angular.module('app', [
  'ngRoute',
  'btford.socket-io',
  'ngTouch'
]).config([ '$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
	$routeProvider.when('/jukebox', {
		templateUrl: 'partials/jukebox.html',
		controller: 'JukeboxController'
	}).when('/free-play', {
		templateUrl: 'partials/free-play.html',
		controller: 'FreePlayController'
	}).otherwise({
		redirectTo: '/free-play'
	});
}]);
