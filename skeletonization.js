//'use strict';

function skeletonize(src)
{
  var width = src.width;
  var height = src.height;

  var dest1 = createBinaryData(width, height);
  var dest2 = createBinaryData(width, height);

  for (var i = 0; i < src.data.length; i++){
    dest1.data[i] = src.data[i];
  }

  var odd = true;
  do{
    function has8Neighours(i) {
      return (i / width > 0
        && i / width < height - 1
        && i % width > 0
        && i % width < width - 1
      )
    }
    function A(P) {
      var A = 0;
      for (var i = 1; i < P.length; i++){
        if (P[i-1] == 0 && P[i] == 1) {
          A++;
        }
      }
      if (P[i-1] == 0 && P[0] == 1) {
        A++;
      }
      return A;
    }
    function B(P) {
      var B = 0;
      for (var i = 0; i < P.length; i++){
        if (P[i]) {
          B++;
        }
      }
      return B;
    }

    var changed = false;
    var s = dest1.data;
    var d = dest2.data;
    var b;
    for (var i = 0; i < s.length; i++) {
      function isRemovable() {
        if (!s[i] || !has8Neighours(i)) {
          return false;
        }

        var P = [
          s[i-width],
          s[i-width+1],
          s[i+1],
          s[i+width+1],
          s[i+width],
          s[i+width-1],
          s[i-1],
          s[i-width-1]
        ];
        if (odd) {
          if ((P[0] && P[2] && P[4]) || (P[2] && P[4] && P[6])) {
            return false;
          }
        } else {
          if ((P[4] && P[6] && P[0]) || (P[6] && P[0] && P[2])) {
            return false;
          }
        }

        b = B(P);
        if (b < 2 || b > 6) {
          return false;
        }

        if (A(P) != 1) {
          return false;
        }

        return true;
      }

      if (isRemovable()) {
        d[i] = false;
        changed = true;
      } else {
        d[i] = s[i];
      }
    }

    var temp = dest1.data;
    dest1.data = dest2.data;
    dest2.data = temp;
    odd = !odd;
  } while(changed)
  return dest1;
}

var skeletonKernel = function skeletoneKernel(index, odd) {
  var shape = this.getShape();
  var width = shape[1];
  var height = shape[0];
  var y = index[0];
  var x = index[1];

  var p = this.get([y,x]);

  if (p == 0 || x == 0 || x == width-1 || y == 0 || y == height-1) {
    return p;
  }

  var P = [
    this.get([y-1,x]),
    this.get([y-1,x+1]),
    this.get([y,x+1]),
    this.get([y+1,x+1]),
    this.get([y+1,x]),
    this.get([y+1,x-1]),
    this.get([y,x]),
    this.get([y-1,x-1])
  ];

  if (odd) {
    if ((P[0] && P[2] && P[4]) || (P[2] && P[4] && P[6])) {
      return p;
    }
  } else {
    if ((P[4] && P[6] && P[0]) || (P[6] && P[0] && P[2])) {
      return p;
    }
  }

  var A = 0;
  for (var i = 1; i < P.length; i++){
    if (P[i-1] == 0 && P[i] == 1) {
      A++;
    }
  }
  if (P[i-1] == 0 && P[0] == 1) {
    A++;
  }
  if (A != 1) {
    return p;
  }

  var B = 0;
  for (var i = 0; i < P.length; i++){
    if (P[i]) {
      B++;
    }
  }

  if (B < 2 || B > 6) {
    return p;
  }

  return 0;
}

var thresholdKernel = function thresholdKernel(idx, threshold) {
  return 0.299 * this.get(idx).get(0) + 0.587 * this.get(idx).get(1) + 0.114 * this.get(idx).get(2);;
}

function skeletonizeDP(src) {
  var dest1 = new ParallelArray(src);
  var sum1 = dest1.reduce(function plus(a,b) { return a+b; });

  var odd = 1;
  while(true) {
    var dest2 = dest1.combine(2, low_precision(skeletonKernel), odd);
    var sum2 = dest2.reduce(function plus(a,b) { return a+b; });

    if (sum1 == sum2) {
      break;
    }
    dest1 = dest2;
    sum1 = sum2;
    odd = 1 - odd;
  }
  return dest1;
}

function skeletonization() {
  var img = document.getElementById("img");
  var originCanvas = document.getElementById("origin");
  var binaryCanvas = document.getElementById("binary");
  var skeletonCanvas = document.getElementById("skeleton");
  var sumCanvas = document.getElementById("sum");

  if (!img || !originCanvas || !binaryCanvas, !skeletonCanvas) {
    // Not Loaded
    requestAnimationFrame(skeletonization);
    return;
  }

  var origin = getImageData(img);
  var binary = binaryScale(origin, 98);
  var skeleton = skeletonize(binary);

  //drawRgb(originCanvas, origin);
  //drawBinary(binaryCanvas, binary);
  drawBinary(skeletonCanvas, skeleton);
  drawBinary2(sumCanvas, binary, skeleton);
  requestAnimationFrame(skeletonization);
}

function skeletonizationDP() {
  var img = document.getElementById("img");
  var originCanvas = document.getElementById("origin");
  var binaryCanvas = document.getElementById("binary");
  var skeletonCanvas = document.getElementById("skeleton");

  if (!img || !originCanvas || !binaryCanvas, !skeletonCanvas) {
    // Not Loaded
    requestAnimationFrame(skeletonization);
    return;
  }

  drawImage(originCanvas, img);
  var origin = ParallelArray(originCanvas);
  var binary = origin.combine(2, low_precision(thresholdKernel), 98);
  //var skeleton = skeletonizeDP(binary);

  //drawBinary(binaryCanvas, binary);
  //drawBinary(skeletonCanvas, skeleton);
  requestAnimationFrame(skeletonizationDP);
}

