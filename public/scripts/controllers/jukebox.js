'use strict';

angular.module('app').controller('JukeboxController', function($scope, socket) {
	// $scope.songs should be equal to a return from an api call getSongs or something like that
	$scope.songs = ["J.S Bach 0 Invention 1", "JOn Batiste - Humanism", "Queen - Under Pressure", "Super Mario Bros", "Imperial March"]
	$scope.playing = "";
	$scope.showPause = false;
	$scope.nothingIsPlaying = true;

	$scope.startPlaying = function(index) {
		$scope.nothingIsPlaying = false;
		if($scope.playing != "") {
			console.log("not equal to blank")
			var temp = $scope.songs[index];
			$scope.songs.splice(index, 1);
			$scope.songs.push($scope.playing);
			$scope.playing = temp;
		} else {
			$scope.playing = $scope.songs[index];
			$scope.songs.splice(index, 1);
			
		}

		socket.emit("play song", $scope.playing);
		
	}

	$scope.stopSong = function() {
		$scope.nothingIsPlaying = true;
		if($scope.playing != "") {
			console.log("lol " + $scope.playing)
			$scope.songs.push($scope.playing);
			$scope.playing = "";
		}
		socket.emit("stop playing song");
		
	}
});
