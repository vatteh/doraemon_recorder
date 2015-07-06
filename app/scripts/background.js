'use strict';
var recording = false;
var recordedSteps = [];
var recordingID = null;
var userID = null;
var userEmail = null;

chrome.runtime.onInstalled.addListener(function (details) {
  	console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === "popupInfoRequest") {
		console.log(userID);
		sendResponse({recording: recording, recordedSteps: recordedSteps, userID: userID, userEmail: userEmail});
	}

	if (request.action === "recordTestStepPopup" && recording) {
		addTestStep(request.value);
		chrome.runtime.sendMessage({action:'addTestStep', value: request.value});
	}

	if (request.action === "recordTestStepContent" && recording && sender.tab.id === recordingID) {
		addTestStep(request.value);
		chrome.runtime.sendMessage({action:'addTestStep', value: request.value});
	}

  // Test Step object
  // { 
  //  stepCode: 
  //  eventText: 
  //  path: (optional)
  //  value: (optional)
  // }
	if (request.action === "startRecording") {
		resetParams();
    	recording = true;
		sendResponse({recording: recording, recordedSteps: recordedSteps, userID: userID, userEmail: userEmail});
		chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
      		recordingID = tabs[0].id;
			chrome.tabs.reload(tabs[0].id, null);
      		var testStep = { stepCode: 1, eventText: 'URL', value: tabs[0].url };
		  	addTestStep(testStep);
			chrome.runtime.sendMessage({action:'addTestStep', value: testStep});
		});
	}

	if (request.action === "cancelRecording") {
    	resetParams();
    	recording = false; 
		sendResponse({recording: recording, recordedSteps: recordedSteps, userID: userID, userEmail: userEmail});
	}

	if (request.action === "userLoggedIn") {
		userID = request.value._id;
		userEmail = request.value.email;
	}

});

function resetParams() {
	recordingID = null;
	recordedSteps = [];
};

function addTestStep(step) {
	recordedSteps.push(step);
};
