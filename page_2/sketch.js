let img;
let p5Canvas;
let numColors = 2;
let context;
let fps = 5;
let period = 1;
let isRunning = false;
let notDrawn = true;
let runBtn, colorSlider, speedSlider, colorValue;

function fitImageToCanvas(img) {
  let imgAspect = img.width / img.height;
  let canvasAspect = width / height;
  let drawWidth, drawHeight;

  if (imgAspect > canvasAspect) {
    // image is wider relative to canvas
    drawWidth = width;
    drawHeight = width / imgAspect;
  } else {
    // image is taller relative to canvas
    drawHeight = height;
    drawWidth = height * imgAspect;
  }

  let x = (width - drawWidth) / 2;
  let y = (height - drawHeight) / 2;
  image(img, x, y, drawWidth, drawHeight);
}

function runBtnHandler() {
  if (isRunning) {
    context = undefined;
    runBtn.html('Start');
    runBtn.style('background-color', '#007BFF');
  } else {
    if (img) {
      start();
      runBtn.html('Stop');
      runBtn.style('background-color', '#F57B7B');
    }
  }
  isRunning = !isRunning;
}

function start() {
  fitImageToCanvas(img);
  loadPixels();
  let labels = []
  for (let i = 0; i < pixels.length/4; i++) {
    labels.push(0);
  }
  context = {
    centroids: initCentroids(pixels, numColors),
    data: new Uint8ClampedArray(pixels),
    loop: true,
    labels: labels,
  };
  notDrawn = false;
}

function setup() {
  p5Canvas = createCanvas(windowWidth * 0.75, windowHeight);
  p5Canvas.parent("canvas-container");
  background(220);
  frameRate(fps);

  cameraBtn = select('#cameraBtn');
  runBtn = select('#runBtn');
  speedSlider = select('#speedSlider');
  colorSlider = select('#colorSlider');
  colorValue = select('#colorValue');

  speedSlider.input(() => {
    period = max(1, floor(fps / speedSlider.value()));
  });
  colorSlider.input(() => {
    numColors = colorSlider.value();
    colorValue.html(numColors);
  });
  runBtn.mousePressed(runBtnHandler);
  document.getElementById("upload").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      background(220);
      img = loadImage(URL.createObjectURL(file));
      notDrawn = true;
      runBtn.removeAttribute('disabled');
    }
  });
}


function pixelDistanceSq(r, g, b, centroid) {
  let x = centroid[0] - r;
  let y = centroid[1] - g;
  let z = centroid[2] - b;
  return x*x + y*y + z*z;
}

function pixelDistance(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  return Math.sqrt(x*x + y*y + z*z);
}

function randint(lower, upper) {
  return floor(random(lower, upper));
}

function initCentroids(pixels, numCentroids) {
  let out = [];
  for (let i = 0; i < numCentroids; i++) {
    let k = randint(0, pixels.length/4);
    let r = pixels[4*k];
    let g = pixels[4*k + 1];
    let b = pixels[4*k + 2];
    out.push([r, g, b]);
  }

  return out;
}

const MAXDIST = 3*255*255 + 1;

function updateCentroids() {
  function mapper(x) {
    return {"sum": [0,0,0], "totalElements": 0};
  }
  let centroidAvg = context.centroids.map(mapper);

  const dataLen = context.data.length/4;
  const cenLen = context.centroids.length
  for (let i = 0; i < dataLen; i++) {
    let closest = null;
    let minDistanceSq = MAXDIST;
    const r = context.data[4*i];
    const g = context.data[4*i + 1];
    const b = context.data[4*i + 2];
    for (let j = 0; j < cenLen; j++) {
      const centroid = context.centroids[j];
      const x = centroid[0] - r;
      const y = centroid[1] - g;
      const z = centroid[2] - b;
      const distanceSq =  x*x + y*y + z*z;
      if (distanceSq < minDistanceSq) {
        closest = j;
        minDistanceSq = distanceSq;
      }
    }
    context.labels[i] = closest;
    let sum = centroidAvg[closest].sum
    sum[0] += r;
    sum[1] += g;
    sum[2] += b;
    centroidAvg[closest].totalElements += 1;
  }

  let newCentroids = [];
  for (let i = 0; i < centroidAvg.length; i++) {
    const sum = centroidAvg[i].sum;
    const total = centroidAvg[i].totalElements;
    let centroid = [
      sum[0]/total,
      sum[1]/total,
      sum[2]/total,
    ];
    newCentroids.push(centroid);
  }

  return newCentroids;
}

function reduceColors() {
  let newCentroids = updateCentroids();
  for (let i = 0; i < context.labels.length; i++) {
    let color = context.centroids[context.labels[i]];
    pixels[i*4]     = color[0];
    pixels[i*4 + 1] = color[1];
    pixels[i*4 + 2] = color[2];
  }

  let loop = false;
  for (let i = 0; i < newCentroids.length; i++) {
    let d = pixelDistance(context.centroids[i], newCentroids[i]);
    if (d > 1) {
      loop = true;
      break;
    }
  }

  context.centroids = newCentroids;
  context.loop = loop;
  return;
}

let frames = 0;

function draw() {
  if (context && context.loop && isRunning) {
    reduceColors();
    updatePixels();
  }

  if (context != undefined && context.loop == false) {
    runBtnHandler();
  }

  frames++;
}

function windowResized() {
  resizeCanvas(windowWidth * 0.75, windowHeight);
  if (img) redraw();
}
