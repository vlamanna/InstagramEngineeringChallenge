// Create a new image.
var img = new Image();

var imgWidth = 640;
var imgHeight = 359;
	
function unshred() {
	$('#unshred').hide();
	
	$('#status').html('Step 1: Calculate the luminance of the pixels');
	$('#status').show();
	
	showLuminance();
	
	$('#status').delay(1000).fadeOut(500, function() {
		$('#status').html('Step 2: Find the width of the bands');
		$('#status').show();
		
		var numBands = findWidth();
		
		$('#status').delay(1000).fadeOut(500, function() {
			$('#status').html('Step 3: Recover the original image');
			$('#status').show();
			
			findOriginal(numBands);
		});
	});
}

function findOriginal(numBands) {
	var bandWidth = imgWidth / numBands;
	
	var elem = document.getElementById('myCanvas');
	if (!elem || !elem.getContext) {
		return;
	}
	
	var context = elem.getContext('2d');
	if (!context) {
		return;
	}
	
	context.drawImage(img, 0, 0);
	
	var match = {};
	var bands = {};
	for (var i = 1; i <= numBands; i++) {
		match[i] = findMatch(i, numBands, bandWidth);
		
		bands[i] = context.getImageData((i-1) * bandWidth, 0, bandWidth, imgHeight);
	}
	
	var firstBand = 0;
	for (var i = 1; i <= numBands; i++) {
		firstBand = i;
		var noMatch = true;
		for (var j = 1; j < numBands; j++) {
			if (match[j] == i) {
				noMatch = false;
				break;
			}
		}
		if (noMatch) {
			break;
		}
	}
	
	var currentBand = firstBand;
	for (var i = 1; i <= numBands; i++) {
		context.putImageData(bands[currentBand], (i-1) * bandWidth, 0);
		
		currentBand = match[currentBand];
	}
}

function findMatch(band, numBands, bandWidth) {
	var minDiff = -1;
	var bestMatch = 0;
	
	for (var i = 1; i <= numBands; i++) {
		if (i != band) {
			var diff = compareBands(band, i, bandWidth);
			
			if (diff < minDiff || minDiff == -1) {
				minDiff = diff;
				bestMatch = i;
			}
		}
	}
	
	return bestMatch;
}

function compareBands(band1, band2, bandWidth) {
	var elem = document.getElementById('myCanvas');
	if (!elem || !elem.getContext) {
		return;
	}
	
	var context = elem.getContext('2d');
	if (!context) {
		return;
	}
	
	var imgd1 = context.getImageData(band1 * bandWidth - 1, 0, 1, imgHeight);
	var pix1 = imgd1.data;
	
	var imgd2 = context.getImageData((band2 - 1) * bandWidth, 0, 1, imgHeight);
	var pix2 = imgd2.data;
	
	var totalDiff = 0;
	
	for (var i = 1; i < imgHeight; i+= 12) {
		var Y1 = 0.2126 * pix1[i*4] + 0.7152 * pix1[i*4+1] + 0.0722 * pix1[i*4+2];
		var Y2 = 0.2126 * pix2[i*4] + 0.7152 * pix2[i*4+1] + 0.0722 * pix2[i*4+2];
		
		var DiffY = Math.abs(Y1 / 16 - Y2 / 16);
					
		totalDiff += DiffY;
	}
	
	return totalDiff;
}

function findWidth() {
	var elem = document.getElementById('myCanvas');
	if (!elem || !elem.getContext) {
		return;
	}
	
	var context = elem.getContext('2d');
	if (!context) {
		return;
	}
	
	var imgd = context.getImageData(0, 0, imgWidth, imgHeight);
	var pix = imgd.data;
	
	var maxDiff = 0;
	var maxBands = 0;
	var maxWidth = 0;
	
	for (var i = 2; i < imgWidth; i++) {
		if (Math.ceil(imgWidth/i) == imgWidth/i) {
			var bandWidth = imgWidth / i;
			var totalDiff = 0;
			
			for (var j = 0, n = pix.length; j < n; j += (4 * bandWidth)) {
				if (j % (4*imgWidth) != 0) {
					var Y1 = pix[j] / 16;
					var Y2 = pix[j-4] / 16;
					
					var diffY = Math.abs(Y1 - Y2);
					
					totalDiff += diffY;
				}
			}
			
			var avgDiff = totalDiff / i;
			
			if (avgDiff >= maxDiff) {
				maxDiff = avgDiff;
				maxBands = i;
				maxWidth = bandWidth;
			}
		}
	}
	
	context.strokeStyle = '#0f0';
	context.lineWidth   = 2;

	for (var i = 1; i < maxBands; i++) {
		context.beginPath();
		context.moveTo(i * maxWidth, 0);
		context.lineTo(i * maxWidth, imgHeight);
		context.stroke();
		context.closePath();
	}
	
	return maxBands;
}

function showLuminance() {
	var elem = document.getElementById('myCanvas');
	if (!elem || !elem.getContext) {
		return;
	}
	
	var context = elem.getContext('2d');
	if (!context) {
		return;
	}
	
	var imgd = context.getImageData(0, 0, imgWidth, imgHeight);
	var pix = imgd.data;
	
	for (var i = 0, n = pix.length; i < n; i += 4) {
		var Y = 0.2126 * pix[i] + 0.7152 * pix[i+1] + 0.0722 * pix[i+2];
		
		pix[i] = Y;
		pix[i+1] = Y;
		pix[i+2] = Y;
	}
	
	context.putImageData(imgd, 0, 0);
}

$(document).ready(function(){
	var elem = document.getElementById('myCanvas');
	if (!elem || !elem.getContext) {
		return;
	}
	
	var context = elem.getContext('2d');
	if (!context) {
		return;
	}
	
	img.addEventListener('load', function () {
		context.drawImage(this, 0, 0);
	}, false);
	
	img.src = 'TokyoPanoramaShredded.png';
});