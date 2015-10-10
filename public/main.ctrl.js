'use strict';

angular.module('app').controller("MainController", ['$scope', '$http', function($scope, $http){

	$scope.flat = false;
	$scope.sharp = false;
	var keyMap = {
    		'65': 'a',
    		'66': 'b',
    		'67': 'c',
    		'68': 'd',
    		'69': 'e',
    		'70': 'f',
    		'71': 'g'
    	}
    $scope.startMusic = function() {
    	console.log('WE STARTED SOMETHING BBY');
    }

    $scope.stopMusic = function() {
    	console.log('WE STOPPPED IT')
    }

    $scope.triggerNote = function(event) {
    	//Determine note
    	var keyPressed = keyMap["" + event.keyCode];
       	if(keyPressed) {
       	}



    	//Send note to server


    }
}]);