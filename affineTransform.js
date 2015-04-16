'use strict';

function drawRedDot(el, x, y) {
  var dot = document.createElement("div");
  dot.classList.add("redDot");
  dot.style.left = x;
  dot.style.top = y;
  el.appendChild(dot);
};

var AT = {
  sourceElement: undefined,
  targetElement: undefined,
  MovedCanvas: undefined,
  differenceCanvas: undefined,
  selectElement: undefined,

  sourcePoints: [],
  targetPoints: [],

  matrix: undefined,

  interpolation: 'nearest',

  init: function () {
    AT.sourceElement = document.getElementById("source"),
    AT.targetElement = document.getElementById("target"),
    AT.movedCanvas = document.getElementById("moved"),
    AT.differenceCanvas = document.getElementById("difference"),
    AT.selectElement = document.getElementById("interpolation"),

    AT.sourceElement.addEventListener('click', function (e) {
      var x = e.pageX - this.offsetLeft;
      var y = e.pageY - this.offsetTop;
      drawRedDot(this.parentElement, e.pageX, e.pageY);
      AT.sourcePoints.push([x, y, 1]);
      AT.run();
    });

    AT.targetElement.addEventListener('click', function (e) {
      var x = e.pageX - this.offsetLeft;
      var y = e.pageY - this.offsetTop;
      drawRedDot(this.parentElement, e.pageX, e.pageY);
      AT.targetPoints.push([x, y, 1]);
      AT.run();
    });

    AT.selectElement.addEventListener('change', function (e) {
      AT.interpolation = this.value;
      AT.run();
    });
  },

  run: function () {
    if (AT.sourcePoints.length < 3 || AT.targetPoints.length < 3) {
      return;
    }
    var source = getImageData(AT.sourceElement);
    var target = getImageData(AT.targetElement);

    AT.calculateAffineTransformMatrix();
    AT.drawMovedImage();
    AT.drawDifference();
  },

  calculateAffineTransformMatrix: function () {
    // Least mean square algorithm
    var n = math.min(AT.sourcePoints.length, AT.targetPoints.length);

    var A = 0, B = 0; // FIXME: rename variables.

    for (var i = 0; i < n; i++) {
      var X = [[1, 0, AT.sourcePoints[i][0], AT.sourcePoints[i][1], 0, 0],
              [0, 1, 0, 0, AT.sourcePoints[i][0], AT.sourcePoints[i][1]]];
      var q = [[AT.targetPoints[i][0]], [AT.targetPoints[i][1]]];
      A = math.add(A, math.multiply(math.transpose(X), X));
      B = math.add(B, math.multiply(math.transpose(X), q));
    }

    var theta = math.multiply(math.inv(A), B);

    AT.matrix = [[theta[2][0], theta[3][0], theta[0][0]],
                 [theta[4][0], theta[5][0], theta[1][0]],
                 [0, 0, 1]];
    console.log(AT.matrix);
  },

  drawMovedImage: function() {
    var source = getImageData(AT.sourceElement);
    var target = getImageData(AT.targetElement);

    var width = AT.sourceElement.width;
    var height = AT.sourceElement.height;

    AT.movedCanvas.width = width;
    AT.movedCanvas.height = height;

    var movedContext = AT.movedCanvas.getContext("2d");
    var moved = movedContext.createImageData(width, height);

    var M = math.inv(AT.matrix);

    console.log(AT.interpolation);
    for (var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        var A = [[x], [y], [1]];
        var B = math.multiply(M, A);
        var newX = B[0][0];
        var newY = B[1][0];

        if (AT.interpolation === 'nearest'){
          newX = math.round(newX);
          newY = math.round(newY);
          if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            var i = (y * width + x) * 4;
            var j = (newY * width + newX) * 4;
            moved.data[i] = source.data[j];
            moved.data[i+1] = source.data[j+1];
            moved.data[i+2] = source.data[j+2];
            moved.data[i+3] = source.data[j+3];
          }
        } else {
          if (newX >= 0 && newX < width - 1 && newY >= 0 && newY < height - 1) {
            var X = math.floor(newX);
            var Y = math.round(newY);
            var a = newX - X;
            var b = newY - Y;

            var i = (y * width + x) * 4;
            var ul = (Y * width + X) * 4;
            var ur = (Y * width + (X + 1)) * 4;
            var dl = ((Y + 1) * width + X) * 4;
            var dr = ((Y + 1) * width + (X+1)) * 4;

            var s = source.data;
            for(var j = 0; j < 4; j++) {
              moved.data[i+j] =
                (1-b)*(1-a) * s[ul+j]
                + (1-b)*a * s[ur+j]
                + b*(1-a) * s[dl+j]
                + b*a * s[dr+j];
            }
          }
        }
      }
    }
    movedContext.putImageData(moved, 0, 0);
  },

  drawDifference: function() {
    function distance(a, b) {
      var d = ((a - b) * (a - b))/256;
      if (d>255) {
        d=255;
      }
      return d;
    }
    var width = AT.sourceElement.width;
    var height = AT.sourceElement.height;

    var target = getImageData(AT.targetElement);

    var movedContext = AT.movedCanvas.getContext("2d");
    var moved = movedContext.getImageData(0, 0, width, height);

    AT.differenceCanvas.width = width;
    AT.differenceCanvas.height = height;

    var differenceContext = AT.differenceCanvas.getContext("2d");
    var difference = differenceContext.createImageData(width, height);

    for (var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        var i = (y * width + x) * 4;
        difference.data[i] = distance(target.data[i], moved.data[i]);
        difference.data[i+1] = distance(target.data[i+1], moved.data[i+1]);
        difference.data[i+2] = distance(target.data[i+2], moved.data[i+2]);
        difference.data[i+3] = 255;
      }
    }
    differenceContext.putImageData(difference, 0, 0);
  }


};


