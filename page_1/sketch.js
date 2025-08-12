let circleSize = 50;
let frames = 0;
let period = 10;
let fps = 20;
let pointsPerClick = 1;
let brushSpread = 50;

let points = [];
let centroids = [];
let clusters = [];
let backgroundColor;
let sizeSlider, clearBtn, runBtn, paintBtn, brushSlider, spreadSlider, speedSlider;

let currentChoice = 0;
let colors;

let isRunning = false;
let isCentroid = false;

function star(x, y, r) {
  const npoints = 8;
  const radius1 = r/2;
  const radius2 = radius1 / 2;
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function circle(x, y, radius) {
  ellipse(x, y, radius, radius)
}

function displayNumber(value, pos) {
  textSize(24);
  fill(0);
  textAlign(RIGHT, BOTTOM);
  text(value, pos.x, pos.y);
}

function verticalLine(color, pos, lineHeight) {
  fill(color);
  rect(pos.x, pos.y - (lineHeight/2), 2, lineHeight);
}

function horizontalRule(color, start, end) {
  fill(color);
  line(start.x, start.y, end.x, end.y);
}

function medianPoint(points) {
  let avg = createVector(0, 0);
  for (let i = 0; i < points.length; i++) {
    avg.x += points[i].pos.x;
    avg.y += points[i].pos.y;
  }
  avg.x = avg.x/points.length;
  avg.y = avg.y/points.length;
  return avg;
}

class Centroid {
  constructor (pos) {
    this.pos = pos;
    this.color = color(192, 128, 128);
  }
  draw() {
    fill(this.color);
    star(this.pos.x, this.pos.y, circleSize*0.75);
  }
}

class DataPoint {
  constructor (pos) {
    this.pos = pos;
    this.color = color(128, 192, 192);
  }

  draw() {
    fill(this.color);
    circle(this.pos.x, this.pos.y, circleSize)
  }
}

class Cluster {
  constructor (centroid, color) {
    this.centroid = centroid;
    this.centroidHistory = [centroid.pos]
    this.points = [];
    this.color = color;
    centroid.color = this.color;
  }

  addPoint(point) {
    this.points.push(point);
    point.color = this.color;
  }

  updateCentroid(newPos) {
    this.centroidHistory.push(newPos);
    this.centroid.pos = newPos;
  }

  draw() {
    // draw centroid history
    for (let i = this.centroidHistory.length -1; 0 < i; i--) {
      let a = this.centroidHistory[i];
      let b = this.centroidHistory[i-1];
      line(a.x, a.y, b.x, b.y);
    }
  }

  clear() {
    this.points = [];
  }
}

function resetColorPicker() {
  currentChoice = 0;
}

function pickColor() {
  let c = colors[currentChoice];
  currentChoice = (currentChoice+1) % colors.length;
  return c;
}

function createClusters(centroids) {
  resetColorPicker();
  clusters = [];
  for (let i = 0; i < centroids.length; i++) {
    let cluster = new Cluster(centroids[i], pickColor());
    clusters.push(cluster);
  }
}

function clearClusters(clusters) {
  for (let i = 0; i < clusters.length; i++) {
    clusters[i].clear();
  }
}

function nearestPoint(a, points) {
  let nearest = null;
  let minDistance = null;
  for (let i = 0; i < points.length; i++) {
    let distance = a.dist(points[i].pos);
    if (minDistance == null || distance < minDistance) {
      minDistance = distance;
      nearest = points[i].pos;
    }
  }
  return nearest;
}

function updateClusters(points) {
  if (clusters.length == 0) {
    return;
  }

  clearClusters(clusters);

  for (let i = 0; i < points.length; i++) {
    let closest = null;
    let minDistance = null;
    let point = points[i].pos;
    for (let j = 0; j < clusters.length; j++) {
      let centroid = clusters[j].centroid.pos;
      let distance = p5.Vector.dist(point, centroid);

      if (minDistance == null || distance < minDistance) {
        closest = clusters[j];
        minDistance = distance;
      }
    }
    closest.addPoint(points[i]);
  }

  for (let i = 0; i < clusters.length; i++) {
    let pos;
    if (clusters[i].points.length > 0) {
      pos = medianPoint(clusters[i].points);
    } else {
      pos = nearestPoint(clusters[i].centroid.pos, points);
    }
    clusters[i].updateCentroid(pos);
  }
}

function closeEnough(a, b) {
  return p5.Vector.dist(a, b) < 1;
}

function verifyTermination(clusters) {
  for (let i = 0; i < clusters.length; i++) {
    let cluster = clusters[i];
    console.log(cluster.centroidHistory);
    if (cluster.centroidHistory.length > 1) {
      let a = cluster.centroidHistory[cluster.centroidHistory.length-1];
      let b = cluster.centroidHistory[cluster.centroidHistory.length-2];
      if (!closeEnough(a, b)) {
        return false; // algum cluster ainda pode aproximar mais.
      }
    } else {
      return false; // acabou de começar.
    }
  }
  return true;
}

function runBtnHandler() {
    if (isRunning) {
      runBtn.html('Start');
      runBtn.style('background-color', '#007BFF');
    } else {
      runBtn.html('Stop');
      runBtn.style('background-color', '#F57B7B');
      createClusters(centroids);
    }
    isRunning = !isRunning;
}

function paintBtnHandler() {
  if (isCentroid) {
    paintBtn.html('Centroides');
    paintBtn.style('background-color', '#007BFF');
  } else {
    paintBtn.html('Data Point');
    paintBtn.style('background-color', '#F57B7B');
  }
  isCentroid = !isCentroid;
}

function setup() {
  frameRate(fps);
  let cnv = createCanvas(windowWidth * 0.75, windowHeight);
  cnv.parent('canvas-container');

  sizeSlider = select('#sizeSlider');
  brushSlider = select('#brushSlider');
  spreadSlider = select('#spreadSlider');
  speedSlider = select('#speedSlider');
  clearBtn = select('#clearBtn');
  runBtn = select('#runBtn');
  paintBtn = select('#paintBtn');

  sizeSlider.input(() => {
    circleSize = sizeSlider.value();
  });
  brushSlider.input(() => {
    pointsPerClick = brushSlider.value();
  });
  spreadSlider.input(() => {
    brushSpread = spreadSlider.value();
  });
  speedSlider.input(() => {
    period = max(1, floor(fps / speedSlider.value()));
  });
  clearBtn.mousePressed(() => {
    points = [];
    centroids = [];
    clusters = [];
  });
  runBtn.mousePressed(runBtnHandler);
  paintBtn.mousePressed(paintBtnHandler);

  backgroundColor = color(220, 220, 220)
  colors = [
    color(230, 25, 75),
    color(60, 180, 75),
    color(255, 225, 25),
    color(0, 130, 200),
    color(245, 130, 48),
    color(145, 30, 180),
    color(70, 240, 240),
    color(240, 50, 230),
    color(210, 245, 60),
    color(250, 190, 190)
  ];
}

function draw() {
  background(backgroundColor);
  for (let i = 0; i < points.length; i++) {
    points[i].draw();
  }
  for (let i = 0; i < centroids.length; i++) {
    centroids[i].draw();
  }
  for (let i = 0; i < clusters.length; i++) {
    clusters[i].draw();
  }

  if (isRunning && frames % period == 0) {
    updateClusters(points);
    if (verifyTermination(clusters)) {
      runBtnHandler();
    }
  }
  frames++;
}

function windowResized() {
  let newWidth = windowWidth * 0.75;
  let newHeight = windowHeight;
  resizeCanvas(newWidth, newHeight);
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 &&
         x <= width && y <= height;
}

function clickHandler(mouseX, mouseY) {
  let pos = createVector(mouseX, mouseY)
  if (isCentroid) {
    // sempre queremos apenas um centroide.
    centroids.push(new Centroid(pos));
  } else {
    if (pointsPerClick == 1) {
      // queremos ser precisos nesse caso
      points.push(new DataPoint(pos));
    } else {
      for (let i = 0; i < pointsPerClick; i++) {
        let r = createVector(random(-brushSpread, brushSpread), random(-brushSpread, brushSpread));
        let newPos = p5.Vector.add(pos, r);
        points.push(new DataPoint(newPos));
      }
    }
  }
}

function mousePressed() {
  if (inBounds(mouseX, mouseY)) {
    clickHandler(mouseX, mouseY);
  }
}

function touchStarted() {
  if (inBounds(mouseX, mouseY)) {
    clickHandler(mouseX, mouseY);
    return false;
  }
  return true;
}
