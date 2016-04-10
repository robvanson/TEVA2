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

function cut_silent_margins (recordedArray, sampleRate) {
	// Find part with sound
	var silentMargin = 0.1;
	// Silence thresshold is -30 dB
	var soundLength = recordedArray.length;
	var thressHoldDb = 30;
	var sumSquare = 0;
	for (var i = 0; i < soundLength; ++i) {
		sumSquare += recordedArray[i] * recordedArray[i];
	};
	var power = sumSquare / soundLength;
	
	var silenceThresshold = Math.pow(10, -1 * thressHoldDb / 20) * Math.sqrt (power);
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
	if (lastSample >= soundLength) soundLength - 1;
	soundArray = recordedArray.subarray(firstSample, lastSample + 1);
	
	return soundArray;
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
	recordingLight.style.left = (5 + (10*dBpower / 600) * 2 ) + "%";
	recordingLight.style.fontSize = (600 - 10*dBpower) + "%";
};

function draw_waveform (canvasId, color, typedArray, tmin, tmax) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.05 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.05 * drawingCtx.canvas.height
	var tickLength = 10;
	
	var verMax = 1;
	var verMin = -1;
	var deltaVer = 0.1 * plotHeight;
	var horMin = tmin;
	var horMan = tmax;
	var deltaHor = plotWidth / 20;
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numSamples = typedArray.length;
	
	// Draw axes
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	drawingCtx.moveTo(horMargin, 0);
	drawingCtx.lineTo(horMargin, plotHeight);
	drawingCtx.lineTo(horMargin + plotWidth, plotHeight);
	drawingCtx.stroke();
	// Draw ticks
	// Vertical
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.1;
	for (var v = 0; v <= plotHeight; v += deltaVer) {
		drawingCtx.moveTo(horMargin - tickLength, v);
		drawingCtx.lineTo(horMargin, v);
		drawingCtx.stroke();
	};
	// Horizontal
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.1;
	for (var h = 0; h <= plotWidth; h += deltaHor) {
		drawingCtx.moveTo(horMargin + h, plotHeight);
		drawingCtx.lineTo(horMargin + h, plotHeight + 2*tickLength);
		drawingCtx.stroke();
	};

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
		prevTime = currentTime;
		prevValue = currentValue;
	};
	drawingCtx.stroke();
};
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
	recordedArray = typedArray;
	var sampleRate = decoded.sampleRate;
	var length = decoded.length;
	
	// Process and draw audio
	var subArray = cut_silent_margins (recordedArray, sampleRate);
	var duration = subArray.length * sampleRate;
	
	display_recording_level ("RecordingLight", subArray);
	draw_waveform ("DrawingArea", "black", subArray, sampleRate, duration)
};
