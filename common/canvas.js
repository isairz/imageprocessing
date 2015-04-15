'use strict';

function getImageData(img) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function createBinaryData(width, height) {
  return {
    width: width,
    height: height,
    data: new Uint8ClampedArray(width * height)
  }
}

function binaryScale(rgb, threshold) {
  var width = rgb.width;
  var height = rgb.height;

  var rgbData = rgb.data;
  var binary = createBinaryData(width, height);

  for (var i = 0; i < rgbData.length; i+=4) {
    var r = rgbData[i];
    var g = rgbData[i+1];
    var b = rgbData[i+2];
    var lum = (0.299*r + 0.587*g + 0.114*g);
    binary.data[i/4] = lum < threshold ? true : false;
  }

  return binary;
}

function drawRgb(canvas, rgb) {
  canvas.width = rgb.width;
  canvas.height = rgb.height;

  var ctx = canvas.getContext("2d");
  ctx.putImageData(rgb, 0, 0);
}

function drawBinary(canvas, binary) {
  var width = binary.width;
  var height = binary.height;

  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");

  var rgb = ctx.createImageData(width, height);
  var rgbData = rgb.data;
  for (var i = 0; i < rgbData.length; i+=4) {
    var color = binary.data[i/4] ? 255 : 0;
    rgbData[i] = color;
    rgbData[i+1] = color;
    rgbData[i+2] = color;
    rgbData[i+3] = 255;
  }

  ctx.putImageData(rgb, 0, 0);
}

