'use strict';

app.factory('HttpFactory', function ($http) {

    return {
        sendSteps: function (steps) {
            return $http.post('http://localhost:1337/api/test-steps', steps).then(function (response) {
                return response.data;
            });
        }
    };

});

app.controller('PanelController', function ($scope, HttpFactory) {

	$scope.recording;
	$scope.recordedSteps = [];
	$scope.recordButtonText;

	chrome.runtime.sendMessage({action: "popupInfoRequest"}, updatePopup);

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	  	if (request.action === 'addTestStep') {
	  		$scope.recordedSteps.push(parseStep(request.value));
	  	}

	  	$scope.$digest();
	});

	$scope.recordUISteps = function() {
		if ($scope.recording) {
			chrome.runtime.sendMessage({action: "cancelRecording"}, updatePopup);
		} else {
			chrome.runtime.sendMessage({action: "startRecording"}, updatePopup);
		}
	};

	$scope.takeSnapshot = function() {
		var lastStep = $scope.recordedSteps[$scope.recordedSteps.length - 1];
		if ($scope.recording && $scope.recordedSteps.length === 0 || $scope.recordedSteps[$scope.recordedSteps.length - 1] !== 'Take snapshot') {
			chrome.runtime.sendMessage({action:'recordTestStepPopup', value: ['Take snapshot']});
		}
	};

	$scope.saveSteps = function() {
		chrome.runtime.sendMessage({action: "popupInfoRequest"}, function(currentData) {
			HttpFactory.sendSteps(currentData.recordedSteps).then( function(data) {
				chrome.runtime.sendMessage({action: "cancelRecording"}, updatePopup);
				alert('Yeah! Data sent and response loaded.');
			}, function (err) {
				alert('Oops! Something goes wrong.');
				console.log(err);
			});
		});
	};

	function updatePopup(currentData) {
		$scope.recording = currentData.recording;
		$scope.recordedSteps = [];
		currentData.recordedSteps.forEach(function(step) {
			$scope.recordedSteps.push(parseStep(step));
		});

		if ($scope.recording) {
			$scope.recordButtonText = 'Cancel Recording';
			chrome.browserAction.setBadgeText({text: 'Rec'});
		} else {
			$scope.recordButtonText = 'Start Recording';
			chrome.browserAction.setBadgeText({text: ''});
		}

		$scope.$digest();
	};

	function parseStep(request) {
		var eventType = request[0];
		var text = eventType;

		if (request[1]) { 
			text += ' at ' + request[1].join(' > ');
		}

		if (request[2]) {
			text += ' of value ' + request[2];
		}

		return text;
	};

});