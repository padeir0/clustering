let img;
let p5Canvas;
let numColors = 2;
let out;
let data = [];
let fps = 5;
let period = 1;
let isRunning = false;
let notDrawn = true;
let runBtn, colorSlider, speedSlider, colorValue ;

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
    out = undefined;
    data = []
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
  for (let i = 0; i < pixels.length; i += 4) {
    data.push([pixels[i], pixels[i+1], pixels[i+2]]);
  }
  out = {
    centroids: initCentroids(data, numColors),
    data: data.map(x => null),
    loop: true,
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

function pixelDistance(a, b) {
  let x = b[0] - a[0];
  let y = b[1] - a[1];
  let z = b[2] - a[2];
  return Math.sqrt(x*x + y*y + z*z)
}

function randint(lower, upper) {
  return floor(random(lower, upper));
}

function initCentroids(data, numCentroids) {
  let out = [];
  for (let i = 0; i < numCentroids; i++) {
    out.push(data[randint(0, data.length)]);
  }
  return out;
}

function updateCentroids(data, centroids) {
  function mapper(x) {
    return {"sum": [0,0,0], "totalElements": 0};
  }
  let centroidAvg = centroids.map(mapper);
  let labels = data.map(x => 0);

  for (let i = 0; i < data.length; i++) {
    let closest = null;
    let minDistance = null;
    let point = data[i];
    for (let j = 0; j < centroids.length; j++) {
      let centroid = centroids[j];
      let distance = pixelDistance(point, centroid);

      if (minDistance == null || distance < minDistance) {
        closest = j;
        minDistance = distance;
      }
    }
    labels[i] = closest;
    centroidAvg[closest].sum[0] += data[i][0];
    centroidAvg[closest].sum[1] += data[i][1];
    centroidAvg[closest].sum[2] += data[i][2];
    centroidAvg[closest].totalElements += 1;
  }

  let newCentroids = [];
  for (let i = 0; i < centroidAvg.length; i++) {
    let sum = centroidAvg[i].sum;
    let total = centroidAvg[i].totalElements;
    let centroid = [
      sum[0]/total,
      sum[1]/total,
      sum[2]/total,
    ];
    newCentroids.push(centroid);
  }

  return {"labels": labels, "centroids": newCentroids};
}

function reduceColors(outdata, data, centroids) {
  let res = updateCentroids(data, centroids);
  for (let i = 0; i < res.labels.length; i++) {
    outdata[i] = res.centroids[res.labels[i]];
  }

  let loop = false;
  for (let i = 0; i < centroids.length; i++) {
    let d = pixelDistance(centroids[i], res.centroids[i]);
    if (d > 1) {
      loop = true;
      break;
    }
  }
  
  return {
    "data": outdata,
    "centroids": res.centroids,
    "loop": loop,
  };
}

let frames = 0;

function draw() {
  if (out && out.loop && isRunning) {
    out = reduceColors(out.data, data, out.centroids);

    for (let i = 0; i < out.data.length; i++) {
      pixels[i*4]     = out.data[i][0];
      pixels[i*4 + 1] = out.data[i][1];
      pixels[i*4 + 2] = out.data[i][2];
    }
    updatePixels();
  }

  if (out != undefined && out.loop == false) {
    runBtnHandler();
  }

  frames++;
}

function windowResized() {
  resizeCanvas(windowWidth * 0.75, windowHeight);
  if (img) redraw();
}
