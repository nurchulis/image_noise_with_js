var canvas;
var context;
var iW = 0; // image width
var iH = 0; // image height
var p1 = 0.99;
var p2 = 0.99;
var p3 = 0.99;
var er = 0; // extra red
var eg = 0; // extra green
var eb = 0; // extra blue
var iBlurRate = 0;
var func = ''; // last used function

window.onload = function() {
    // creating context for original image
    canvasOrig = document.getElementById('orig');
    contextOrig = canvasOrig.getContext('2d');

    // draing original image
    var imgObj = new Image();
    imgObj.onload = function () {
        iW = this.width;
        iH = this.height;
        contextOrig.drawImage(imgObj, 0, 0, iW, iH); // draw the image on the canvas
        
    localStorage.setItem( "savedImageData", canvas.toDataURL("image/png") );
    }
    imgObj.src = 'images/xs.jpg';
    // creating testing context
    canvas = document.getElementById('panel');
    context = canvas.getContext('2d');
};

// Filters functions

function Grayscale() {
    func = 'grayscale'; // last used function
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (var i = 0, n = data.length; i < n; i += 4) {
        var grayscale = data[i] * p1 + data[i+1] * p2 + data[i+2] * p3;
        data[i]   = grayscale + er; // red
        data[i+1] = grayscale + eg; // green
        data[i+2] = grayscale + eb; // blue
    }
    context.putImageData(imgd, 0, 0);
}

function Color() {
    func = 'color'; // last used function
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (var i = 0, n = data.length; i < n; i += 4) {
        data[i]   = data[i]*p1+er; // red
        data[i+1] = data[i+1]*p2+eg; // green
        data[i+2] = data[i+2]*p3+eb; // blue
    }
    context.putImageData(imgd, 0, 0);
}

function Blur() {
    func = 'blur'; // last used function
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (br = 0; br < iBlurRate; br += 1) {
        for (var i = 0, n = data.length; i < n; i += 4) {

            iMW = 4 * iW;
            iSumOpacity = iSumRed = iSumGreen = iSumBlue = 0;
            iCnt = 0;

            // data of close pixels (from all 8 surrounding pixels)
            aCloseData = [
                i - iMW - 4, i - iMW, i - iMW + 4, // top pixels
                i - 4, i + 4, // middle pixels
                i + iMW - 4, i + iMW, i + iMW + 4 // bottom pixels
            ];

            // calculating Sum value of all close pixels
            for (e = 0; e < aCloseData.length; e += 1) {
                if (aCloseData[e] >= 0 && aCloseData[e] <= data.length - 3) {
                    iSumOpacity += data[aCloseData[e]];
                    iSumRed += data[aCloseData[e] + 1];
                    iSumGreen += data[aCloseData[e] + 2];
                    iSumBlue += data[aCloseData[e] + 3];
                    iCnt += 1;
                }
            }

            // apply average values
            data[i] = (iSumOpacity / iCnt)*p1+er;
            data[i+1] = (iSumRed / iCnt)*p2+eg;
            data[i+2] = (iSumGreen / iCnt)*p3+eb;
            data[i+3] = (iSumBlue / iCnt);
        }
    }
    context.putImageData(imgd, 0, 0);
}

function Noise() {
    func = 'noise'; // last used function
    var imgd = contextOrig.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (var i = 0, n = data.length; i < n; i += 4) {

       // generating random color coefficients
       var randColor1 = 0.6 + Math.random() * 0.4;
       var randColor2 = 0.6 + Math.random() * 0.4;
       var randColor3 = 0.6 + Math.random() * 0.4;

        // assigning random colors to our data
        data[i] = data[i]*p2*randColor1+er; // green
        data[i+1] = data[i+1]*p2*randColor2+eg; // green
        data[i+2] = data[i+2]*p3*randColor3+eb; // blue
    }

    // put image date back to context
    context.putImageData(imgd, 0, 0);
}

function Invert(vContext) {
    func = 'color'; // last used function
    var imgd = vContext.getImageData(0, 0, iW, iH);
    var data = imgd.data;

    for (var i = 0, n = data.length; i < n; i += 4) {

        // assigning inverted colors to our data
        data[i] = 255 - data[i]; // green
        data[i+1] = 255 - data[i+1]; // green
        data[i+2] = 255 - data[i+2]; // blue
    }

    // put image date back to context
    vContext.putImageData(imgd, 0, 0);
}

// Adjustment functions

function changeGrayValue(val) {
    p1 += val;
    p2 += val;
    p3 += val;

    switch(func) {
        case 'grayscale': Grayscale(); break;
        case 'color': Color(); break;
        case 'blur': Blur(); break;
        case 'noise': Noise(); break;
    }
}

function changeColorValue(sobj, val) {
    switch (sobj) {
        case 'er': er += val; break;
        case 'eg': eg += val; break;
        case 'eb': eb += val; break;
    }

    switch(func) {
        case 'grayscale': Grayscale(); break;
        case 'color': Color(); break;
        case 'blur': Blur(); break;
        case 'noise': Noise(); break;
    }
}

function changeBlurValue(val) {
    iBlurRate += val;

    if (iBlurRate <= 0) Color();
    if (iBlurRate > 4) iBlurRate = 4;

    Blur();
}

function resetToColor() {
    p1 = 1;
    p2 = 1;
    p3 = 1;
    er = eg = eb = 0;
    iBlurRate = 0;

    Color();
}
function resetToBlur() {
    p1 = 1;
    p2 = 1;
    p3 = 1;
    er = eg = eb = 0;
    iBlurRate = 1;

    Blur();
}
function resetToNoise() {
    p1 = 1;
    p2 = 1;
    p3 = 1;
    er = eg = eb = 0;
    iBlurRate = 1;

    Noise();
}
function resetToInvert() {
    p1 = 1;
    p2 = 1;
    p3 = 1;
    er = eg = eb = 0;
    iBlurRate = 1;

    if (func == '') Color();
    Invert(context);
    Invert(contextOrig);
}
function resetToGrayscale() {
    p1 = 0.3;
    p2 = 0.59;
    p3 = 0.11;
    er = eg = eb = 0;
    iBlurRate = 0;

    Grayscale();
}

    