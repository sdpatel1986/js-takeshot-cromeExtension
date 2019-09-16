var lc;

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

$( document ).ready(function() {
	chrome.runtime.sendMessage({loaded: true}, function(response) {
		originalHeight = (response.canvasHeight * 0.5 + 33);
		originalWidth = response.canvasWidth;

		width = originalWidth / 0.5;
		height = originalHeight / (originalWidth / width);
		$("#target").attr('src', response.dataUri);
	    var dkrm = new Darkroom('#target', {
	      // Size options
	      minWidth: 100,
	      minHeight: 100,
	      maxWidth: 800,
	      maxHeight: 600,
	      ratio: 4/3,
	      backgroundColor: '#000',

	      // Plugins options
	      plugins: {
			save: {
			      callback: function() {
			      	  this.darkroom.selfDestroy(); // Cleanup
			      	  var format = prompt("Enter the export format (jpeg, png, gif)", "png");
			          var newImage = this.darkroom.sourceCanvas.toDataURL('image/' + format);
			          downloadURI(newImage, 'screenshot.' + format);
			      }
			}
	      },

	      // Post initialize script
	      initialize: function() {
	        var cropPlugin = this.plugins['crop'];
	        // cropPlugin.selectZone(170, 25, 300, 300);
	        cropPlugin.requireFocus();
	      }
	    });
	});
});