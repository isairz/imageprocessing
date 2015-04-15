'use strict';

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
    var changed = false;
    function has8Neighours(i) {
      return (i >= width
        && i / width < height - 1
        && i % width > 1
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

    var s = dest1.data;
    var d = dest2.data;
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

        var b = B(P);
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

    var start = new Date();
    var temp = dest1;
    dest1 = dest2;
    dest2 = dest1;
    odd = !odd;
    break;
  } while(changed)
  console.log(new Date()-start);
  return dest1;
}

function skeletonization() {
  var img = document.getElementById("img");
  var originCanvas = document.getElementById("origin");
  var binaryCanvas = document.getElementById("binary");
  var skeletonCanvas = document.getElementById("skeleton");

  if (!img || !originCanvas || !binaryCanvas, !skeletonCanvas) {
    // Not Loaded
    requestAnimationFrame(skeletonization);
    return;
  }

  var origin = getImageData(img);
  var binary = binaryScale(origin, 98);
  var skeleton = skeletonize(binary);

  drawRgb(originCanvas, origin);
  drawBinary(binaryCanvas, binary);
  drawBinary(skeletonCanvas, skeleton);
  requestAnimationFrame(skeletonization);
}

