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


/*
 * Global variables from audioProcessing
 * 
 * var recordedBlob, recordedBlobURL;
 * var recordedArray, currentAudioWindow;
 * var recordedSampleRate, recordedDuration;
 *
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
	
	var numFrames = typedArray.length;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var tScale = plotWidth / numFrames;
	var vScale = plotHeight / 2;

	drawingCtx.moveTo(horMargin, verMargin + plotHeight / 2 - typedArray[0] * vScale);
	for(var i = 1; i < numFrames; i+=1) {
		var currentTime = tmin + i * tScale;
		var currentValue = typedArray[i];
		drawingCtx.lineTo(horMargin + currentTime , plotHeight / 2 - currentValue * vScale);
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
	
	var fMin = 60;
	var fMax = 600;
	var dT = 0.01;
	var horMin = 0;
	var horMax = duration;
	var maxPower = 40;
	var verMax = fMax;
	var verMin = 0;
	
	if (! pitch) pitch = calculate_Pitch (typedArray, sampleRate, fMin, fMax, dT);
	verMax = Math.ceil(Math.max.apply(Math, pitch) * 1.5 / 10) * 10;
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numFrames = horMax / dT;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 2;
	
	// Scale to plot area
	var hScale = plotWidth / numFrames;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - pitch[0] * vScale);
	for(var i = 1; i < numFrames; ++i) {
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

var intensity = 0; 
function draw_intensity (canvasId, color, typedArray, sampleRate, duration) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	
	var fMin = 60;
	var fMax = 600;
	var dT = 0.01;
	
	var tmin = 0;
	var tmax = duration;
	var maxPower = 90;
	var verMax = maxPower;
	var verMin = 0;
	var deltaVer = 0.1 * plotHeight;
	var horMin = tmin;
	var horMax = tmax;
	var deltaHor = plotWidth / 20;
	
	// Calculate Intensity (negative wrt amplitude 1)
	intensity = calculate_Intensity (typedArray, sampleRate, fMin, fMax, dT)
	// Determine dynamic range (watch out for NEGATIVE INFINITY)
	var minIntensity = maxPower;
	var maxIntensity = -maxPower;
	for (var i = 0; i < intensity.length; ++i) {
		if(intensity[i] > Number.NEGATIVE_INFINITY && minIntensity > intensity[i]) minIntensity = intensity[i];
		if(intensity[i] > Number.NEGATIVE_INFINITY && maxIntensity < intensity[i]) maxIntensity = intensity[i];
	};
	maxPower = Math.abs(10*Math.floor((maxIntensity - minIntensity)/10) - 10);
	verMax = maxPower;

	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numFrames = intensity.length;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var tScale = plotWidth / numFrames;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - intensity[0] * vScale);
	for(var i = 1; i < numFrames; i+=1) {
		var currentTime = tmin + i * tScale;
		var currentValue = maxPower + (isNaN(intensity[i]) ? -maxPower : intensity[i]);
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
	
	var numFrames = fMax/sampleRate * powerSpectrum.length ;
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var hScale = plotWidth / numFrames;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - powerSpectrum[0] * vScale);
	for(var i = 1; i < numFrames; ++i) {
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
	var verMaxText = verMax > 10 ? Math.round(verMax) : (verMax > 1) ? Math.round(verMax*10)/10 : verMax .toFixed(2);
	var horMaxText = horMax > 10 ? Math.round(horMax) : (horMax > 1) ? Math.round(horMax*10)/10 : horMax .toFixed(2);
	var fontSize = 20;
	drawingCtx.font = fontSize+"px Helvetica";
	drawingCtx.fillText(verMin+"", 0, plotHeight+fontSize);	
	drawingCtx.fillText((verMax.toPrecision(3)), 0, fontSize);	
	drawingCtx.fillText(horMin+"", horMargin, plotHeight+ 2* tickLength+fontSize);	
	drawingCtx.fillText((horMax.toPrecision(3)), plotWidth + horMargin - (horMax.toPrecision(3).length * fontSize/2), plotHeight+ 2* tickLength+fontSize);	


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
	intensity = 0;
};

// Handle sound after decoding (used in audioProcessing.js)
function processRecordedSound () {
	display_recording_level ("RecordingLight", recordedArray);
	drawSignal (teva_settings.display)
};
