//'use strict';

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

function getImageData(image) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  drawImage(canvas, image);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function drawImage(canvas, image) {
  var ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function drawRgb(canvas, rgb) {
  canvas.width = rgb.width;
  canvas.height = rgb.height;

  var ctx = canvas.getContext("2d");
  ctx.putImageData(rgb, 0, 0);
}

function drawBinary(canvas, binary) {
  var width = binary.width || binary.getShape()[1];
  var height = binary.height || binary.getShape()[0];

  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");

  var rgb = ctx.createImageData(width, height);
  var rgbData = rgb.data;
  for (var i = 0; i < rgbData.length; i+=4) {
    var color = binary.data[i/4] ? 0 : 255;
    rgbData[i] = color;
    rgbData[i+1] = color;
    rgbData[i+2] = color;
    rgbData[i+3] = 255;
  }

  ctx.putImageData(rgb, 0, 0);
}

function drawBinary2(canvas, binary1, binary2) {
  var width = binary1.width || binary1.getShape()[1];
  var height = binary1.height || binary1.getShape()[0];

  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");

  var rgb = ctx.createImageData(width, height);
  var rgbData = rgb.data;
  for (var i = 0; i < rgbData.length; i+=4) {
    var color = binary2.data[i/4] ? 0 : binary1.data[i/4] ? 100 : 255;
    rgbData[i] = color;
    rgbData[i+1] = color;
    rgbData[i+2] = color;
    rgbData[i+3] = 255;
  }

  ctx.putImageData(rgb, 0, 0);
}
