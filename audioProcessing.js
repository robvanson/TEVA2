/* 
 * TEVA 2
 * Copyright (C) 2016 R.J.J.H. van Son (r.j.j.h.vanson@gmail.com)
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You can find a copy of the GNU General Public License at
 * http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 */
var setDrawingParam = function (canvasId) {
	var drawingArea = document.getElementById(canvasId);
	var drawingCtx = drawingArea.getContext("2d");
	return drawingCtx;
};

var initializeDrawingParam = function (canvasId) {
	var drawingArea = document.getElementById(canvasId);
	var drawingCtx = drawingArea.getContext("2d");
	resetDrawingParam(drawingCtx);
	return drawingCtx;
};

var resetDrawingParam = function (drawingCtx) {
	drawingCtx.clearRect(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height);
	drawingCtx.lineWidth = 0.5;
	drawingCtx.strokeStyle = "black";
	drawingCtx.lineCap = "round";
	drawingCtx.lineJoin = "round";
};

var testDrawing = function (canvasId, color, order) {
	var drawingCtx = setDrawingParam(canvasId)
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	drawingCtx.moveTo(250 + order,250);
	drawingCtx.lineTo(750 - order,750);
	drawingCtx.stroke();
};

function display_recording_level (id, recordedArray) {
	var sumSquare = 0;
	for (var i = 0; i < recordedArray.length; ++i) {
		sumSquare += recordedArray[i] * recordedArray[i];
	};
	var power = sumSquare / recordedArray.length;
	var dBpower = Math.log10(power) * -10
	// limit power to between -6 and -55 dB)
	dBpower = (dBpower > 6) ? dBpower - 6 : 0;
	dBpower = Math.min(dBpower, 55);
	
	var recordingLight = document.getElementById(id);
	recordingLight.style.top = (5 + (10*dBpower / 600) * 6 ) + "%";
	recordingLight.style.left = (2 + (10*dBpower / 600) * 2 ) + "%";
	recordingLight.style.fontSize = (600 - 10*dBpower) + "%";
};

function drawSignal (display) {
	var canvasId = "DrawingArea";
	var color = "black";
	var drawingCtx = setDrawingParam(canvasId);
	resetDrawingParam (drawingCtx);
	if (recordedArray) {
		if (display == "Sound") {
			draw_waveform (canvasId, color, recordedArray, recordedSampleRate, recordedDuration);
		} else if (display == "Pitch") {
			draw_pitch (canvasId, color, recordedArray, recordedSampleRate, recordedDuration);		
		} else if (display == "Spectrogram") {
		} else if (display == "Ltas") {
			draw_ltas (canvasId, color, recordedArray, recordedSampleRate, recordedDuration);		
		} else if (display == "Intensity") {
			draw_intensity (canvasId, color, recordedArray, recordedSampleRate, recordedDuration);		
		} else {
		}
	};
}

function draw_waveform (canvasId, color, typedArray, sampleRate, duration) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	var tickLength = 10;
	
	var tmin = 0;
	var tmax = duration;
	var verMax = 1;
	var verMin = -1;
	var deltaVer = 0.1 * plotHeight;
	var horMin = 0;
	var horMax = duration;
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numSamples = typedArray.length;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var tScale = plotWidth / numSamples;
	var vScale = plotHeight / 2;
	
	drawingCtx.moveTo(horMargin, verMargin + plotHeight / 2 - typedArray[0] * vScale);
	for(var i = 1; i < numSamples; i+=1) {
		var currentTime = tmin + i * tScale;
		var currentValue = typedArray[i];
		drawingCtx.lineTo(horMargin + i * tScale , plotHeight / 2 - currentValue * vScale);
	};
	drawingCtx.stroke();
};

// Keep analysis
var pitch = 0; 
function draw_pitch (canvasId, color, typedArray, sampleRate, duration) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	
	var fMin = 75;
	var fMax = 600;
	var dT = 0.01;
	var horMin = 0;
	var horMax = duration;
	var maxPower = 40;
	var verMax = fMax;
	var verMin = 0;
	
	if (! pitch) pitch = calculate_Pitch (typedArray, sampleRate, fMin, fMax, dT);
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numSamples = horMax / dT;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 2;
	
	// Scale to plot area
	var hScale = plotWidth / numSamples;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - pitch[0] * vScale);
	for(var i = 1; i < numSamples; ++i) {
		var currentTime = horMin + i * hScale;
		var currentValue = pitch[i];
		if (currentValue > 0) {
			if (resetLine) {
				drawingCtx.moveTo(horMargin + i * hScale , plotHeight - currentValue * vScale);
				resetLine = 0;
			} else {
				drawingCtx.lineTo(horMargin + i * hScale , plotHeight - currentValue * vScale);
			};
		} else {
			drawingCtx.moveTo(horMargin + i * hScale , plotHeight - currentValue * vScale);
			resetLine = 1;			
		};
	};
	drawingCtx.stroke();
};

function draw_intensity (canvasId, color, typedArray, sampleRate, duration) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	
	var tmin = 0;
	var tmax = duration;
	var maxPower = 100;
	var verMax = maxPower;
	var verMin = 0;
	var deltaVer = 0.1 * plotHeight;
	var horMin = tmin;
	var horMax = tmax;
	var deltaHor = plotWidth / 20;
	
	// Calculate Intensity
	// This is stil just the power in dB.
	var dT = 0.01
	var numFrames = Math.ceil(duration / dT);
	var intensityArray = new Float32Array(numFrames);
	for (var t=0; t < duration; t += dT) {
		var sumSquares = 0;
		var n = 0;
		var jstart = Math.floor(t * sampleRate);
		var jend = Math.ceil((t + dT) * sampleRate);
		if (jend > typedArray.length) jend = typedArray.length;
		for (var j = jstart; j < jend; ++j) {
			sumSquares += typedArray[j] * typedArray[j];
			++n;
		};
		var i = Math.floor(t / dT);
		var power = (n > 0) ? maxPower - Math.log10(sumSquares / n) * -10 : 0;
		if (power < 0) power = 0;
		intensityArray [i] = power;
	};
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numSamples = intensityArray.length;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var tScale = plotWidth / numSamples;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - intensityArray[0] * vScale);
	for(var i = 1; i < numSamples; i+=1) {
		var currentTime = tmin + i * tScale;
		var currentValue = intensityArray[i];
		if (currentValue > 0) {
			drawingCtx.lineTo(horMargin + i * tScale , plotHeight - currentValue * vScale);
		};
	};
	drawingCtx.stroke();
};

function draw_ltas (canvasId, color, typedArray, sampleRate, duration) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	
	var fMin = 0;
	var fMax = teva_settings.frequency * 1000; 
	var horMin = fMin;
	var horMax = fMax;
	var maxPower = 90;
	var verMax = maxPower;
	var verMin = 0;
	
	// Calculate FFT
	// This is stil just the power in dB.
	var inputLength = typedArray.length;
	var FFT_N = Math.pow(2, Math.ceil(Math.log2(inputLength))) * 2;
	var input = new Float32Array(FFT_N * 2);
	var output = new Float32Array(FFT_N * 2);
	for (var i = 0; i < FFT_N; ++i) {
		input [2*i] = (i < inputLength) ? typedArray [i] : 0;
		input [2*i + 1] = 0; 
	};
	var fft = new FFT.complex(FFT_N, false);
	var ifft = new FFT.complex(FFT_N, true);
		
	fft.simple(output, input, 1)
	// ifft.simple(input, output, 1)

	// Calculate the power spectrum
	var powerSpectrum = new Float32Array(FFT_N);
	// Scale per frequency
	var scalingPerHz = Math.log10(typedArray.length/sampleRate) * 10;
	var powerScaling = Math.log10(FFT_N) * -20 + scalingPerHz;
	for(var i = 0; i < FFT_N; ++ i) {
		var powerValue = (output[2*i]*output[2*i] + output[2*i+1]*output[2*i+1]);
		powerSpectrum[i] = Math.log10(powerValue) * 10;
	};

	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numSamples = fMax/sampleRate * powerSpectrum.length ;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var hScale = plotWidth / numSamples;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - powerSpectrum[0] * vScale);
	for(var i = 1; i < numSamples; ++i) {
		var currentTime = fMin + i * hScale;
		var currentValue = powerSpectrum[i];
		if (currentValue > 0) {
			drawingCtx.lineTo(horMargin + i * hScale , plotHeight - currentValue * vScale);
		};
	};
	drawingCtx.stroke();
	
};

function plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth, verMin, verMax, horMin, horMax) {
	var scaleVer = verMax - verMin;
	var scaleHor = horMax - horMin;
	var tickLength = 10;
	var deltaVer = scaleVer / Math.pow(10, Math.floor(Math.log10(scaleVer)));
	if (deltaVer < 5) deltaVer *= 10;
	deltaVer = plotHeight / deltaVer;
	
	var deltaHor = (scaleHor) / Math.pow(10, Math.floor(Math.log10(scaleHor)));
	if(deltaHor < 7) deltaHor *= 10;
	deltaHor = plotWidth / deltaHor;
	
	// Draw axes
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 1;
	drawingCtx.moveTo(horMargin, 0);
	drawingCtx.lineTo(horMargin, plotHeight);
	drawingCtx.lineTo(horMargin + plotWidth, plotHeight);
	drawingCtx.stroke();
	// Draw ticks
	// Vertical
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 1;
	for (var v = plotHeight; v >= 0; v -= deltaVer) {
		drawingCtx.beginPath();
		drawingCtx.moveTo(horMargin - tickLength, v);
		drawingCtx.lineTo(horMargin, v);
		drawingCtx.stroke();
	};
	
	// Write text
	var fontSize = 20;
	drawingCtx.font = fontSize+"px Helvetica";
	drawingCtx.fillText(verMin+"", 0, plotHeight+fontSize);	
	drawingCtx.fillText(verMax+"", 0, fontSize);	
	drawingCtx.fillText(horMin+"", horMargin, plotHeight+ 2* tickLength+fontSize);	
	drawingCtx.fillText(horMax+"", plotWidth, plotHeight+ 2* tickLength+fontSize);	


	// Horizontal
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 1;
	for (var h = 0; h <= plotWidth; h += deltaHor) {
		drawingCtx.beginPath();
		drawingCtx.moveTo(horMargin + h, plotHeight);
		drawingCtx.lineTo(horMargin + h, plotHeight + 2*tickLength);
		drawingCtx.stroke();
	};
	
};

function initializeExistingAnalysis () {
	pitch = 0;
};

/*
 * 
 * Audio processing code
 * 
 */
 
// Decode the audio blob
var audioProcessing_decodedArray;
function processAudio (blob) {
	var audioContext = new AudioContext();
	var reader = new FileReader();
	reader.onload = function(){
		var arrayBuffer = reader.result;
		audioContext.decodeAudioData(arrayBuffer, decodedDone);
	};
	reader.readAsArrayBuffer(blob);
};

function decodedDone(decoded) {
	var typedArray = new Float32Array(decoded.length);
	typedArray = decoded.getChannelData(0);
	var currentArray = typedArray;
	recordedSampleRate = decoded.sampleRate;
	recordedDuration = decoded.duration;
	var duration = decoded.duration;
	var length = decoded.length;
	
	// Initialize existing recordings
	initializeExistingAnalysis ();
	
	// Process and draw audio
	recordedArray = cut_silent_margins (currentArray, recordedSampleRate);
	currentAudioWindow = recordedArray;
	recordedDuration = recordedArray.length / recordedSampleRate;
	
	display_recording_level ("RecordingLight", recordedArray);
	drawSignal (teva_settings.display)
};

function play_soundArray (soundArray, sampleRate) {
	var audioCtx = new window.AudioContext;
	var soundBuffer = audioCtx.createBuffer(1, soundArray.length, sampleRate);
	var buffer = soundBuffer.getChannelData(0);	
	for (var i = 0; i < soundArray.length; i++) {
	     buffer[i] = soundArray[i];
	};
	
	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	var source = audioCtx.createBufferSource();
	// set the buffer in the AudioBufferSourceNode
	source.buffer = soundBuffer;
	// connect the AudioBufferSourceNode to the
	// destination so we can hear the sound
	source.connect(audioCtx.destination);
	// start the source playing
	source.start();
};

// Cut off the silent margins
function cut_silent_margins (recordedArray, sampleRate) {
	// Find part with sound
	var silentMargin = 0.1;
	// Silence thresshold is -30 dB
	var soundLength = recordedArray.length;
	var thressHoldDb = 30;
	// Crude calculation of maximum power
	var maxAmp = 0;
	for (var i = 0; i < soundLength; ++i) {
		var currentValue = Math.abs(recordedArray[i]);
		if(currentValue > maxAmp) {
			maxAmp = currentValue;
		};
	};
	
	var silenceThresshold = Math.pow(10, -1 * thressHoldDb / 20) * Math.sqrt (maxAmp);
	var firstSample = soundLength;
	var lastSample = 0;
	for (var i = soundLength - 1; i >= 0; --i) {
		if (Math.abs(recordedArray[i]) >= silenceThresshold) firstSample = i;
	};
	for (var i = 0; i < soundLength; ++i) {
		if (Math.abs(recordedArray[i]) >= silenceThresshold) lastSample = i;
	};
	firstSample -= silentMargin * sampleRate;
	if (firstSample < 0) firstSample = 0;
	lastSample += silentMargin * sampleRate;
	if (lastSample >= soundLength) lastSample = soundLength - 1;
	var newLength = lastSample - firstSample;
	var soundArray = new Float32Array(newLength);
	for (var i = 0; i < newLength; ++i) {
		soundArray [i] = recordedArray[firstSample + i];
	};
	return soundArray;
};

// Calculate autocorrelation in a window (array!!!) around time
// You should divide the result by the autocorrelation of the window!!!
function autocorrelation (sound, sampleRate, time, window) {
	// Calculate FFT
	// This is stil just the power in dB.
	var soundLength = sound.length;
	var windowLength = (window) ? window.length : soundLength;
	var FFT_N = Math.pow(2, Math.ceil(Math.log2(windowLength))) * 2;
	var input = new Float32Array(FFT_N * 2);
	var output = new Float32Array(FFT_N * 2);
	// The window can get outside of the sound itself
	var offset = Math.floor(time * sampleRate - Math.ceil(windowLength/2));
	if (window) {
		for (var i = 0; i < FFT_N; ++i) {
			input [2*i] = (i < windowLength && (offset + i) > 0 && (offset + i) < soundLength) ? sound [offset + i] * window [i] : 0;
			input [2*i + 1] = 0;
		};
	} else {
		for (var i = 0; i < FFT_N; ++i) {
			input [2*i] = (i < windowLength && (offset + i) > 0 && (offset + i) < soundLength) ? sound [offset + i] : 0;
			input [2*i + 1] = 0;
		};
	};
	var fft = new FFT.complex(FFT_N, false);
	var ifft = new FFT.complex(FFT_N, true);
	fft.simple(output, input, 1)

	// Calculate H * H(cj)
	// Scale per frequency
	for(var i = 0; i < FFT_N; ++ i) {
		var squareValue = (output[2*i]*output[2*i] + output[2*i+1]*output[2*i+1]);
		input[2*i] = squareValue;
		input[2*i+1] = 0;
		output[2*i] = 0;
		output[2*i+1] = 0;
	};
	
	ifft.simple(output, input, 1);
	
	var autocorr = new Float32Array(FFT_N);
	for(var i = 0; i < FFT_N; ++ i) {
		 autocorr[i] = output[2*i] / windowLength;
	};

	return autocorr;
};

function calculate_Pitch (sound, sampleRate, fMin, fMax, dT) {
	var duration = sound.length / sampleRate;
	var pitchArray = new Float32Array(Math.floor(duration / dT));
	var lagMin = (fMax > 0) ? 1/fMax : 1/600;
	var lagMax = (fMin > 0) ? 1/fMin : 1/60;
	var thressHold = 0.05;
	
	// Set up window and calculate Autocorrelation of window
	var windowDuration = lagMax * 6;
	var windowSigma = 1/6;
	var window = new Float32Array(windowDuration * sampleRate);
	var windowCenter = (windowDuration * sampleRate -1) / 2;
	var windowSumSq = 0;
	for (var i = 0; i < windowDuration * sampleRate; ++i) {
		var exponent = -0.5 * Math.pow( (i - windowCenter)/(windowSigma * windowCenter), 2);
		window [i] = Math.exp(exponent);
		windowSumSq += window [i]*window [i];
	};
	var WindowRMS = Math.sqrt(windowSumSq/window.length);

	// calculate the autocorrelation of the window
	var windowAutocorr = autocorrelation (window, sampleRate, windowDuration / 2, 0);
	
	// Step through the sound
	var startLag = Math.floor(lagMin * sampleRate);
	var endLag = Math.ceil(lagMax * sampleRate);
	for (var t = 0; t < duration; t += dT) {
		var autocorr = autocorrelation (sound, sampleRate, t, window);
		for (var i = 0; i < autocorr.length; ++i) {
			autocorr [i] /= (windowAutocorr [i]) ? (windowAutocorr [i] * WindowRMS) : 0;
		};
		
		// Find the "real" pitch
		var bestLag = 0;
		var bestAmp = -100;
		for (var j = startLag; j <= endLag; ++j) {
			if (autocorr [j] > thressHold && autocorr [j] > bestAmp) {
				bestAmp = autocorr [j];
				bestLag = j;
			};
		};
		var pitch = bestLag ? sampleRate / bestLag : 0;

		// Add pitch
		pitchArray [Math.floor(t / dT)] = pitch;
	};
	return pitchArray;
};
