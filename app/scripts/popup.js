'use strict';

app.factory('HttpFactory', function ($http) {

    return {
        sendSteps: function (testCaseData) {
            return $http.post('http://localhost:1337/api/test-case/extension', testCaseData).then(function (response) {
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
		if ($scope.recording && $scope.recordedSteps.length === 0 || $scope.recordedSteps[$scope.recordedSteps.length - 1] !== 'Take Snapshot') {
			chrome.runtime.sendMessage({action:'recordTestStepPopup', value: {stepCode: 2, eventText: 'Take Snapshot'}});
		}
	};

	$scope.saveSteps = function() {
		chrome.runtime.sendMessage({action: "popupInfoRequest"}, function(currentData) {
			HttpFactory.sendSteps({steps: currentData.recordedSteps, userID: currentData.userID}).then( function(newTestCase) {
				chrome.runtime.sendMessage({action: "cancelRecording"}, updatePopup);
				finishForm(newTestCase);
				// display success in popup
			}, function (err) {
				// display error in popup
				console.log(err);
			});
		});
	};

	function finishForm(newTestCase) {
		chrome.tabs.create({ url: 'http://localhost:1337/admin/test-case/' + newTestCase._id });
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

	// Test Step object
	// { 
	//  eventCode: 
	//  eventText: 
	//  path: (optional)
	//  value: (optional)
	// }
	function parseStep(request) {
		var text = request.eventText;

		if (request.path) { 
			text += ' at ' + request.path.join(' > ');
		}

		if (request.value) {
			text += ' of value ' + request.value;
		}

		return text;
	};

});