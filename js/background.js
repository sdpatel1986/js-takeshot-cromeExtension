$( document ).ready(function() {
	var video = document.getElementById('video');
	var canvas = document.getElementById('canvas');
	var photo = document.getElementById('photo');
	var width = window.screen.width;
	var notifications = [];
	var url;
	function handleGetDesktopCapture(streamId, options) {
		var getUserMediaOptions = {
		    video: {
		      mandatory: {
		        chromeMediaSource: 'desktop',
		        chromeMediaSourceId: streamId,
		        maxWidth: window.screen.width,
		        maxHeight: window.screen.height
		      }
		    }
		};
		navigator.webkitGetUserMedia(getUserMediaOptions, handleStream, handleStreamError);
	}

	function handleStream(stream) {
		video.srcObject = stream;
		video.play();
	}

	function handleStreamError(err) {
		console.log(err);
	}

	video.addEventListener('canplay', function(ev){
		var when = Date.now() + 1000;
		chrome.alarms.create('takeScreenshot', {when: when});
	});

	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name === 'takeScreenshot') {
			var height = video.videoHeight / (video.videoWidth/width);

			video.setAttribute('width', width);
			video.setAttribute('height', height);
			canvas.setAttribute('width', width);
			canvas.setAttribute('height', height);
		    var context = canvas.getContext('2d');
		    if (width && height) {
		    	canvas.width = width;
		    	canvas.height = height;
		    	context.drawImage(video, 0, 0, width, height);

				video.srcObject.getTracks().forEach(function(track) {
		        	track.stop();
		    	});

				url = canvas.toDataURL('image/png');
				chrome.tabs.create({
					url: chrome.runtime.getURL('popup.html')
				});
		    }
		}
	})


	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.loaded) {
		  sendResponse({
		  	dataUri: url,
		  	canvasHeight: canvas.height,
		  	canvasWidth: canvas.width
		  });
		}
	});

	chrome.browserAction.onClicked.addListener(function(tab) {
		chrome.desktopCapture.chooseDesktopMedia(["screen"], handleGetDesktopCapture);
	});
});