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

var lightSize = 15;
var maxPowerRecorded = 90;
var thresshold = 0.1;
function display_recording_level (id, typedArray) {
	var sumSquare = 0;
	var nSamples = 0;
	for (var i = 0; i < typedArray.length; ++i) {
		if(Math.abs(typedArray[i]) > thresshold) {
			sumSquare += typedArray[i] * typedArray[i];
			++nSamples;
		};
	};
	var power = sumSquare / nSamples;
	var dBpower = (power > 0) ? maxPowerRecorded + 2*Math.log10(power) * 10 : 0;
	var recordingLight = document.getElementById(id);
	var currentWidth = 100*recordingLight.clientWidth/window.innerWidth;
	var currentHeight = 100*recordingLight.clientHeight/window.innerHeight;
	var horMidpoint = 2 + currentWidth/2;
	var verMidpoint = 5 + currentHeight/2;
	
	// New fontSize
	var fontSize = lightSize*dBpower/maxPowerRecorded + 1;
	recordingLight.style.fontSize = fontSize + "vmin";
	
	// position = midpoint - newFontSize / 2
	recordingLight.style.top = (verMidpoint - ((fontSize/lightSize)*currentHeight)/2) + "%";
	recordingLight.style.left = (horMidpoint - ((fontSize/lightSize)*currentWidth)/2) + "%";
};

function drawSignal (display) {
	var canvasId = "DrawingArea";
	var color = "black";
	var drawingCtx = setDrawingParam(canvasId);
	resetDrawingParam (drawingCtx);
	if (recordedArray) {
		if (display == "Sound") {
			draw_waveform (canvasId, color, recordedArray, recordedSampleRate, windowStart, windowEnd);
		} else if (display == "Pitch") {
			draw_pitch (canvasId, color, recordedArray, recordedSampleRate, windowStart, windowEnd, windowStart, windowEnd);		
		} else if (display == "Spectrogram") {
			draw_spectrogram (canvasId, color, recordedArray, recordedSampleRate, windowStart, windowEnd, windowStart, windowEnd);
		} else if (display == "Ltas") {
			draw_ltas (canvasId, color, recordedArray, recordedSampleRate, windowStart, windowEnd);		
		} else if (display == "Intensity") {
			draw_intensity (canvasId, color, recordedArray, recordedSampleRate, windowStart, windowEnd, windowStart, windowEnd);		
		} else {
		};
		
		var subscript = JSON.parse(sessionStorage.subscript);
		if (subscript.length <=0)subscript = "";
		if(document.getElementById('SubscriptText')) {
			document.getElementById('SubscriptText').textContent = subscript;
		};

	};
}

function draw_waveform (canvasId, color, typedArray, sampleRate, windowStart, windowEnd) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	var tickLength = 10;
	
	var tmin = windowStart;
	var tmax = windowEnd;
	var verMax = 1;
	var verMin = -1;
	var deltaVer = 0.1 * plotHeight;
	var horMin = tmin;
	var horMax = tmax;
	
	// Determine amplitude
	var amplitude = 0;
	for(var i = 1; i < typedArray.length; ++i) {
		var value = Math.abs(typedArray[i]);
		if (value > amplitude) amplitude = value;
	};
	if (amplitude < 0.071) {
		verMax = Math.ceil(110 * amplitude)/100;
		verMin = -verMax;
	} else if (amplitude < 0.71) {
		verMax = Math.ceil(11 * amplitude)/10;
		verMin = -verMax;
	};
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numFrames = typedArray.length;
	
	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var tScale = plotWidth / numFrames;
	var vScale = plotHeight / (verMax - verMin);
	drawingCtx.moveTo(horMargin, verMargin + plotHeight / 2 - typedArray[0] * vScale);
	for(var i = 1; i < numFrames; i+=1) {
		var currentTime = tmin + i * tScale;
		var currentValue = (typedArray[i]) ? typedArray[i] : 0;
		drawingCtx.lineTo(horMargin + currentTime , plotHeight / 2 - currentValue * vScale);
	};
	drawingCtx.stroke();
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);
	// Plot boundarie using global variables
	plotBoundaries (canvasId, 0, recordedDuration, startTime, endTime);
};

// Keep analysis
var spectrogram = 0; 
function draw_spectrogram (canvasId, color, typedArray, sampleRate, windowStart, windowEnd) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	
	var fMin = 60;
	var fMax = 600;
	var verMin = 0;
	var verMax = teva_settings.frequency * 1000; 
	var dT = 0.01;
	var horMin = windowStart;
	var horMax = windowEnd;
	var maxPower = 90;
	
	if (! spectrogram) spectrogram = calculate_spectrogram (typedArray, sampleRate, fMin, fMax, dT);
	// spectrogram = calculate_spectrogram (typedArray, sampleRate, fMin, fMax, dT);

	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	// Frequency step per sample
	maxFindex = (2 * verMax / sampleRate) * spectrogram[0]["spectrum"].length;
	// Determine maximum
	var pmax = 0;
	for (var i = 0; i < spectrogram.length; ++i) {
		var t = spectrogram[i].t;
		var spectrum = spectrogram[i].spectrum;
		for (var j = 0; j < spectrum.length; ++j) {
			var p = (spectrum[j] > 0) ? 10 * Math.log10(spectrum[j]) : 0;
			if (p > pmax) pmax = p;
		};
	};
	var dynamicRange = 80;
	pmax = pmax > 0 ? pmax : dynamicRange;
	var stepT = (horMax - horMin)/plotWidth;
	var stepF = (verMax - verMin)/plotHeight;
	var dHor = 1;
	var dVer = 1;
	for (var t = windowStart; t < windowEnd; t += stepT) {
		var x = (t - horMin) / (horMax - horMin) * plotWidth;
		for (var f = 0; f < verMax; f += stepF) {
			var y = ((f - verMin) / (verMax - verMin)) * plotHeight;
			var p = getSpectrogramPower (spectrogram, sampleRate, dT, t, f);
			var grayLevel = 255;
			grayLevel = 255*(pmax - p)/dynamicRange;
			grayLevel = (grayLevel < 254) ? Math.round(grayLevel) : 254;
			drawingCtx.fillStyle = "rgb("+grayLevel+", "+grayLevel+", "+grayLevel+")";
			drawingCtx.fillRect(Math.round(horMargin + x), Math.ceil(plotHeight - y), Math.ceil(dHor), Math.ceil(dVer));
			drawingCtx.stroke();
		};
	};
	drawingCtx.fillStyle = "black";
	drawingCtx.stroke();
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);
	// Plot boundarie using global variables
	plotBoundaries (canvasId, 0, recordedDuration, startTime, endTime);
};

// Keep analysis
var pitch = 0; 
function draw_pitch (canvasId, color, typedArray, sampleRate, windowStart, windowEnd) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	var pitchTier = {};
	
	var fMin = 60;
	var fMax = 600;
	var dT = 0.01;
	var horMin = windowStart;
	var horMax = windowEnd;
	var maxPower = 40;
	var verMax = fMax;
	var verMin = 0;
	var recordedDuration = windowEnd - windowStart;
	
	if (! pitch) {
		pitchTier = toPitchTier (typedArray, sampleRate, fMin, fMax, dT);
	};
	maxPitch = pitchTier.valuemax;
	var pitchArray = pitchTier.valueSeries();
	verMax = Math.ceil(maxPitch * 1.5 / 10) * 10;
	
	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numFrames = horMax / dT;
	
	var startIndex = Math.floor(startTime/dT);
	var endIndex = endTime > 0 ? Math.floor(endTime/dT) : pitchArray.length;
	var voicedFract = 100*math_fraction(pitchArray.slice(startIndex, endIndex), function(v){return v>0;});
	var maxWindow = math_max(pitchArray.slice(startIndex, endIndex), function(v){return v>0;});
	var minWindow = math_min(pitchArray.slice(startIndex, endIndex), function(v){return v>0;});
	var meanWindow = math_mean(pitchArray.slice(startIndex, endIndex), function(v){return v>0;});
	var sdWindow = math_std(pitchArray.slice(startIndex, endIndex), function(v){return v>0;});
	var subText = "Pitch - "+"Voiced: "+voicedFract.toPrecision(2)+"%, "+"Max.: "+maxWindow.toPrecision(3)+" Hz, Min.: "+minWindow.toPrecision(3)+" Hz, Mean.: "+meanWindow.toPrecision(3)+" Hz, SD: "+sdWindow.toPrecision(3)+" Hz";

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 2;
	
	// Scale to plot area
	var hScale = plotWidth / recordedDuration;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - pitchArray[0] * vScale);
	var minFrame = Math.floor(horMin/recordedDuration*numFrames);
	var maxFrame = Math.ceil(horMax/recordedDuration*numFrames);
	if (maxFrame > pitch.length) maxFrame = pitch.length;
	for(var i = minFrame; i < maxFrame; ++i) {
		var item = pitchTier.item(i);
		var currentTime = item.x - horMin;
		var currentValue = item.value;
		if (currentValue > 0) {
			if (resetLine) {
				drawingCtx.moveTo(horMargin + currentTime * hScale , plotHeight - currentValue * vScale);
				resetLine = 0;
			} else {
				drawingCtx.lineTo(horMargin + currentTime * hScale , plotHeight - currentValue * vScale);
			};
		} else {
			drawingCtx.moveTo(horMargin + i * hScale , plotHeight - currentValue * vScale);
			resetLine = 1;			
		};
	};
	drawingCtx.stroke();
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);
	plotSubText (canvasId, subText);

	// Plot boundarie using global variables
	plotBoundaries (canvasId, 0, recordedDuration, startTime, endTime);
};

var intensity = 0; 
function draw_intensity (canvasId, color, typedArray, sampleRate, windowStart, windowEnd) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	
	var fMin = 60;
	var fMax = 600;
	var dT = 0.01;
	
	var tmin = windowStart;
	var tmax = windowEnd;
	var maxPower = 96;
	var verMax = maxPower;
	var verMin = 0;
	var deltaVer = 0.1 * plotHeight;
	var horMin = tmin;
	var horMax = tmax;
	var deltaHor = plotWidth / 20;
	
	// Calculate Intensity 
	if (!intensity) {
		intensity = calculate_Intensity (typedArray, sampleRate, fMin, fMax, dT);
	};
	// Determine dynamic range 
	var maxIntensity = Math.max.apply(Math, intensity);
	maxPower = 10*Math.ceil(maxIntensity/10) + 10;
	verMax = maxPower;

	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;
	
	var numFrames = intensity.length;
	
	var startIndex = Math.floor(startTime/dT);
	var endIndex = endTime > 0 ? Math.floor(endTime/dT) : intensity.length;
	var maxWindow = math_max(intensity.slice(startIndex, endIndex), true);
	var minWindow = math_min(intensity.slice(startIndex, endIndex), true);
	var meanWindow = math_mean(intensity.slice(startIndex, endIndex), true);
	var sdWindow = math_std(intensity.slice(startIndex, endIndex), true);
	var subText = "Intensity - "+"Max.: "+maxWindow.toPrecision(3)+" dB, Min.: "+minWindow.toPrecision(3)+" dB, Mean.: "+meanWindow.toPrecision(3)+" dB, SD: "+sdWindow.toPrecision(3)+" dB";
	
	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var tScale = plotWidth / numFrames;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - intensity[0] * vScale);
	var minFrame = Math.floor(tmin/recordedDuration*numFrames);
	var maxFrame = Math.ceil(tmax/recordedDuration*numFrames);
	for(var i = minFrame; i < maxFrame; i+=1) {
		var currentTime = tmin + i * tScale;
		var currentValue = intensity[i];
		if (currentValue > 0) {
			drawingCtx.lineTo(horMargin + i * tScale , plotHeight - currentValue * vScale);
		};
	};
	drawingCtx.stroke();
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);
	plotSubText (canvasId, subText);

	// Plot boundarie using global variables
	plotBoundaries (canvasId, 0, recordedDuration, startTime, endTime);
};

var ltasPowerSpectrum = 0;
var lastStart = lastEnd = -1;
function draw_ltas (canvasId, color, typedArray, sampleRate, windowStart, windowEnd) {
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
	
	// Recalculate if anything changes
	if (! ltasPowerSpectrum || lastStart != startTime || lastEnd != endTime) {
		lastStart = startTime;
		lastEnd = endTime;
		// Calculate FFT
		// Use only the part between the global parameters startTime and endTime
		var startIndex = startTime > 0 ? Math.floor(startTime*sampleRate) : 0;
		var endIndex = endTime > 0 ? Math.ceil(endTime*sampleRate) : typedArray.length;
		if (startIndex > typedArray.length || endIndex > typedArray.length) {
			startIndex = 0;
			endIndex = typedArray.length;
		};
		// This is stil just the power in dB.
		var inputLength = endIndex - startIndex;
		var FFT_N = Math.pow(2, Math.ceil(Math.log2(inputLength))) * 2;
		var input = new Float32Array(FFT_N * 2);
		var output = new Float32Array(FFT_N * 2);
		for (var i = 0; i < FFT_N; ++i) {
			input [2*i] = (i < inputLength) ? typedArray [startIndex + i] : 0;
			input [2*i + 1] = 0; 
		};
		// Remove NaN's from input
		for (var i = 0; i < FFT_N; ++i) {
			if(isNaN(input [2*i]))input [2*i] = 0;
		};
		var fft = new FFT.complex(FFT_N, false);
		var ifft = new FFT.complex(FFT_N, true);
			
		fft.simple(output, input, 1)
		// ifft.simple(input, output, 1)
	
		// Calculate the power spectrum
		ltasPowerSpectrum = new Float32Array(FFT_N);
		var scalingPerHz = Math.log10(typedArray.length/sampleRate) * 10;
		var powerScaling = Math.log10(FFT_N) * -20 + scalingPerHz;
		for(var i = 0; i < FFT_N; ++ i) {
			var powerValue = (output[2*i]*output[2*i] + output[2*i+1]*output[2*i+1]);
			ltasPowerSpectrum[i] = Math.log10(powerValue) * 10;
		};
	};

	// Set scales
	var numFrames = fMax/sampleRate * ltasPowerSpectrum.length ;
	var maxSpectrum = 0;
	var minSpectrum = maxPower;
	for (var i = 0; i < numFrames; ++i) {
		if (ltasPowerSpectrum [i] > maxSpectrum) maxSpectrum = ltasPowerSpectrum [i];
		if (ltasPowerSpectrum [i] < minSpectrum) minSpectrum = ltasPowerSpectrum [i];
	};
	maxPower = Math.ceil(1.1 * maxSpectrum / 10) * 10;

	var verMax = maxPower;
	var verMin = minSpectrum < 0 ? Math.floor(minSpectrum / 10) * 10 : 0;

	// Set parameters
	resetDrawingParam(drawingCtx);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = color;

	// Reset drawing
	drawingCtx.beginPath();
	drawingCtx.lineWidth = 0.5;
	
	// Scale to plot area
	var hScale = plotWidth / numFrames;
	var vScale = plotHeight / verMax;
	var resetLine = 0;
	
	drawingCtx.moveTo(horMargin, plotHeight - ltasPowerSpectrum[0] * vScale);
	for(var i = 1; i < numFrames; ++i) {
		var currentTime = fMin + i * hScale;
		var currentValue = ltasPowerSpectrum[i];
		if (currentValue > 0) {
			drawingCtx.lineTo(horMargin + i * hScale , plotHeight - currentValue * vScale);
		};
	};
	drawingCtx.stroke();
	
	// Draw axes
	plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth,  verMin, verMax, horMin, horMax);
	
	// Print time interval
	if(endTime <= 0) endTime = recordedDuration;
	var text = "["+startTime.toPrecision(3)+", "+endTime.toPrecision(3)+"]";
	var fontSize = 15;
	drawingCtx.font = fontSize+"px Helvetica";
	drawingCtx.fillStyle = "black";
	var xstart = horMargin + plotWidth - text.length*fontSize/2;
	drawingCtx.fillText(text, xstart, fontSize);	
};

function plot_Axes (drawingCtx, horMargin, plotHeight, plotWidth, verMin, verMax, horMin, horMax) {
	var scaleVer = verMax - verMin;
	var scaleHor = horMax - horMin;
	var tickLength = 10;
	var numVer = scaleVer / Math.pow(10, Math.floor(Math.log10(scaleVer)));
	if (numVer < 5) numVer *= 10;
	var deltaVer = plotHeight / numVer;
	// Use to determine "reasonable" longer ticks
	var scaleCountVer = numVer*verMin/scaleVer;
	
	var numHor = (scaleHor) / Math.pow(10, Math.floor(Math.log10(scaleHor)));
	if(numHor < 7) numHor *= 10;
	var deltaHor = plotWidth / numHor;
	var scaleCountHor = numHor*horMin/scaleHor;
	
	// Draw axes
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = "black";
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
		var scaleTick = scaleCountVer % 10 ? 1 : 2;
		drawingCtx.lineWidth = 1*scaleTick;
		drawingCtx.beginPath();
		drawingCtx.moveTo(horMargin - tickLength*scaleTick, v);
		drawingCtx.lineTo(horMargin, v);
		drawingCtx.stroke();
		drawingCtx.lineWidth = 1;
		++scaleCountVer;
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
	drawingCtx.strokeStyle = "black";
	drawingCtx.lineWidth = 1;
	for (var h = 0; h <= plotWidth; h += deltaHor) {
		var scaleTick = scaleCountHor % 10 ? 1 : 1.5;
		drawingCtx.lineWidth = 1*scaleTick;
		drawingCtx.beginPath();
		drawingCtx.moveTo(horMargin + h, plotHeight);
		drawingCtx.lineTo(horMargin + h, plotHeight + 2*tickLength*scaleTick);
		drawingCtx.stroke();
		drawingCtx.lineWidth = 1;
		++scaleCountHor;
	};
	
};

function plotSubText (canvasId, text) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotWidth = 0.95 * drawingCtx.canvas.width;
	var horMargin = 0.02 * drawingCtx.canvas.width;
	var plotHeight = 0.9 * drawingCtx.canvas.height
	var verMargin = 0.02 * drawingCtx.canvas.height
	var fontSize = 20;
	var textX = horMargin + fontSize;
	var textY = plotHeight + verMargin + 2*fontSize;
	
	drawingCtx.font = fontSize+"px Helvetica";
	drawingCtx.fillStyle = "blue";
	drawingCtx.fillText(text, textX, textY);	
	drawingCtx.fillStyle = "black";
};

function initializeExistingAnalysis () {
	pitch = 0;
	intensity = 0;
	spectrogram = 0;
	ltasPowerSpectrum = 0;
	startTime = endTime = 0;
	interval = {left: -1, right: -1, bot: -1, top: -1};
};

// Handle sound after decoding (used in audioProcessing.js)
function processRecordedSound () {
	display_recording_level ("RecordingLight", recordedArray);
	drawSignal (teva_settings.display)
};

function calculate_spectrogram (sound, sampleRate, fMin, fMax, dT) {
	var duration = sound.length / sampleRate;
	var spectrumArray = [];
	var lagMin = (fMax > 0) ? 1/fMax : 1/600;
	var lagMax = (fMin > 0) ? 1/fMin : 1/60;
	var thressHold = 0.01;
	
	// Set up window and calculate Autocorrelation of window
	var windowDuration = lagMax * 6;
	var window = setupGaussWindow (sampleRate, fMin);
	var windowRMS = getWindowRMS (window);

	// Step through the sound
	for (var t = 0; t < duration; t += dT) {
		var currentSpectrum = calculateSingleSpectrum (sound, sampleRate, t, window);
		spectrumArray.push({t: t, spectrum: currentSpectrum});
	};
	return spectrumArray;
};

function getSpectrogramPower (spectrogram, sampleRate, dT, t, f) {
	// Sanity checks
	if (t < 0 || t > spectrogram[spectrogram.length - 1]["t"] ) return 0;
	if (f < 0 || f >= sampleRate / 2) return 0;
	
	// Determine time and frequency slices
	var x = t/dT;
	var y = (2 * f / sampleRate) * spectrogram[0]["spectrum"].length;
	var x1 = Math.floor(x);
	var x2 = x1;
	var y1 = Math.floor(y);
	var f1 = y1*sampleRate/(2*spectrogram[0]["spectrum"].length);
	var y2 = Math.ceil(y);
	var f2 = y2*sampleRate/(2*spectrogram[0]["spectrum"].length);
	
	var t1 = spectrogram[x1]["t"];
	var t2 = t1;
	while (t2 < t && x < spectrogram.length) {
		x1 = x2;
		++x2;
		t1 = t2;
		t2 = spectrogram[x2]["t"];
	};
	while (t1 > t && x >= 0) {
		--x;
		x2 = x1;
		--x1;
		t2 = t1;
		t1 = spectrogram[x1]["t"];
	};
	
	// Get 4 power values
	var p11 = spectrogram[x1]["spectrum"][y1];
	p11 = (p11) ? 10 * Math.log10(p11) : 0;
	var p12 = spectrogram[x1]["spectrum"][y2]
	p12 = (p12) ? 10 * Math.log10(p12) : 0;
	var p21 = spectrogram[x2]["spectrum"][y1]
	p21 = (p21) ? 10 * Math.log10(p21) : 0;
	var p22 = spectrogram[x2]["spectrum"][y2]
	p22 = (p22) ? 10 * Math.log10(p22) : 0;
	
	// interpolate
	var p1 = p11;
	var p2 = p11;
	if (f2 - f1 > 0) {
		p1 = ((f2 - f)*p11 + (f - f1)*p12)/(f2 - f1);
		p2 = ((f2 - f)*p21 + (f - f1)*p22)/(f2 - f1);
	};
	var power = p1;
	if (t2 - t1 > 0) {
		power = ((t2 - t)*p1 + (t - t1)*p2)/(t2 - t1);
	};
	return power;
};

function calculateSingleSpectrum (sound, sampleRate, time, window) {
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
	var powerSpectrum = new Float32Array(FFT_N);
	for(var i = 0; i < FFT_N; ++ i) {
		var squareValue = (output[2*i]*output[2*i] + output[2*i+1]*output[2*i+1]);
		powerSpectrum [i] = squareValue;
	};
	
	return powerSpectrum;
};


// Temp
function getBoundaries (startTime, endTime, canvasId, xleft, ytop, xright, ybot) {
	var drawingCtx = setDrawingParam(canvasId);
	var t1 = startTime + (xleft - 0.02 * drawingCtx.canvas.width)/1000 * (endTime - startTime);
	var t2 = startTime + (xright - 0.02 * drawingCtx.canvas.width)/1000 * (endTime - startTime);
	if (t1 < startTime) t1 = startTime;
	if (t2 > endTime) t2 = endTime;
	return {t1: t1, t2: t2};
};

function plotBoundaries (canvasId, t1, t2, startTime, endTime) {
	var drawingCtx = setDrawingParam(canvasId);
	var plotHeight = 0.9 * drawingCtx.canvas.height;
	var xleft = startTime * 1000/(t2 - t1) + 0.02 * drawingCtx.canvas.width;
	var xright = endTime * 1000/(t2 - t1) + 0.02 * drawingCtx.canvas.width;
	var fontSize = 10;
	
	if (startTime > t1 && startTime < t2) {
		drawingCtx.beginPath();
		drawingCtx.strokeStyle = "blue";
		drawingCtx.lineWidth = 1;
		drawingCtx.moveTo(xleft, 0);
		drawingCtx.lineTo(xleft, plotHeight);
		drawingCtx.stroke();
		drawingCtx.font = fontSize+"px Helvetica";
		drawingCtx.fillStyle = "blue";
		// Print where there is room
		if (xright - xleft > 2*(startTime.toPrecision(3).length+1)*fontSize/2) {
			drawingCtx.fillText(" "+startTime.toPrecision(3), xleft, fontSize);
		} else if (xright - xleft > (startTime.toPrecision(3).length+1)*fontSize/2) {
			drawingCtx.fillText(startTime.toPrecision(3), xleft, fontSize);
		} else {
			drawingCtx.fillText(startTime.toPrecision(3), xleft - ((startTime.toPrecision(3).length+1)*fontSize/2), fontSize);
		};
		drawingCtx.fillStyle = "black";
	};
	if (endTime > t1 && endTime < t2) {
		drawingCtx.beginPath();
		drawingCtx.strokeStyle = "blue";
		drawingCtx.lineWidth = 1;
		drawingCtx.moveTo(xright, 0);
		drawingCtx.lineTo(xright, plotHeight);
		drawingCtx.stroke();
		drawingCtx.font = fontSize+"px Helvetica";
		drawingCtx.fillStyle = "blue";
		// Print where there is room
		if (xright - xleft < (endTime.toPrecision(3).length+1)*fontSize/2) {
			drawingCtx.fillText(" "+endTime.toPrecision(3), xright, fontSize);
		} else if (xright - xleft < 2*(endTime.toPrecision(3).length+1)*fontSize/2) {
			drawingCtx.fillText(endTime.toPrecision(3), xright - ((endTime.toPrecision(3).length) * fontSize/2), 2*fontSize);
		} else {
			drawingCtx.fillText(endTime.toPrecision(3), xright - ((endTime.toPrecision(3).length + 1) * fontSize/2), fontSize);
		};
		drawingCtx.fillStyle = "black";
	};
};
	
function plotRectDrawingArea (canvasId, xleft, ytop, xright, ybot) {
	var drawingCtx = setDrawingParam(canvasId);
	drawingCtx.beginPath();
	drawingCtx.strokeStyle = "blue";
	drawingCtx.lineWidth = 1;
	drawingCtx.moveTo(xleft, ytop);
	drawingCtx.lineTo(xleft, ybot);
	drawingCtx.lineTo(xright, ybot);
	drawingCtx.lineTo(xright, ytop);
	drawingCtx.lineTo(xleft, ytop);
	drawingCtx.stroke();
};


// Additional functions. 
// useValue == true or function useValue (v) {return true/false}

function math_max (array, useValue) {
	if (array.length == 0) return undefined;
	var max = -Infinity;
	for (var i=0; i<array.length; ++i) {
		if(useValue == true || useValue(array[i])) {
			if (array[i] > max) max = array[i];
		};
	};
	return max;
};

function math_min (array, useValue) {
	if (array.length == 0) return undefined;
	var min = Infinity;
	for (var i=0; i<array.length; ++i) {
		if(useValue == true || useValue(array[i])) {
			if (array[i] < min) min = array[i];
		};
	};
	return min;
};

function math_mean (array, useValue) {
	if (array.length == 0) return 0;
	var sum = 0;
	var n = 0;
	for (var i=0; i<array.length; ++i) {
		if(useValue == true || useValue(array[i])) {
			sum += array[i];
			++n;
		};
	};
	return sum / n;
};

function math_variance (array, useValue) {
	if (array.length < 2) return 0;
	var sum = 0;
	var sumSQR = 0;
	var n = 0;
	for (var i=0; i<array.length; ++i) {
		var v = array[i];
		if(useValue == true || useValue(v)) {
			sum += v;
			sumSQR += v*v;
			++n;
		};
	};

	return (sumSQR - sum*sum / array.length) / (array.length - 1);
};

function math_std (array, useValue) {
	var variance = math_variance (array, useValue);
	return Math.sqrt(variance);
};

function math_fraction (array, useValue) {
	var n=0;
	var n_total=0;
	for (var i=0; i<array.length; ++i) {
		var v = array[i];
		++n_total;
		if(useValue == true || useValue(v)) {
			++n;
		};
	};
	return n_total > 0 ? n/n_total : undefined;
};
