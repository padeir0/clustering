let sizeSlider, clearBtn;
let circleSize = 50;
let points = [];
let graph = null;
let graphPadding = 10;
let graphLineHeight = 10;

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

class DataPoint {
  constructor (pos) {
    this.pos = pos;
    this.color = color(128, 192, 192);
  }

  draw() {
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, circleSize, circleSize)
  }
}

class VariabilityGraph {
  constructor (canvasWidth, canvasHeight, padding) {
    this.resize(canvasWidth, canvasHeight, padding);
  }

  draw(points) {
    let median = medianPoint(points).pos;
    let zero = this.startPoint;
    verticalLine(color(32, 0, 0), zero, graphLineHeight+5);
    horizontalRule(color(32,32,32), this.startPoint, this.endPoint);

    let sum = 0;
    let vec = p5.Vector.sub(this.endPoint, this.startPoint).normalize();
    for (let i = 0; i < points.length; i++) {
      let p = points[i].pos;
      let distance = median.dist(p);
      let pt = p5.Vector.add(zero, p5.Vector.mult(vec, distance));
      verticalLine(color(0, 0, 0), pt, graphLineHeight)

      sum += distance * distance;
    }

    sum = floor(sum) / 100;
    displayNumber(sum, this.endPoint);
  }

  resize(canvasWidth, canvasHeight, padding) {
    this.startPoint = createVector(padding, canvasHeight-padding);
    this.endPoint = createVector(canvasWidth-padding, canvasHeight-padding);
  }
}

function middlePoint(a, b) {
  return createVector((a.x+b.x)/2, (a.y + b.y)/2);
}

function medianPoint(points) {
  let avg = createVector(0, 0);
  for (let i = 0; i < points.length; i++) {
    avg.x += points[i].pos.x;
    avg.y += points[i].pos.y;
  }
  avg.x = avg.x/points.length;
  avg.y = avg.y/points.length;
  return new DataPoint(avg);
}

function setup() {
  let cnv = createCanvas(windowWidth * 0.75, windowHeight);
  cnv.parent('canvas-container');

  sizeSlider = select('#sizeSlider');
  clearBtn = select('#clearBtn');

  sizeSlider.input(() => {
    circleSize = sizeSlider.value();
  });

  clearBtn.mousePressed(() => {
    points = [];
  });

  graph = new VariabilityGraph(width, height, graphPadding);
}

function draw() {
  background(220);
  for (let i = 0; i < points.length; i++) {
    points[i].draw();
  }
  if (points.length > 0) {
    let p = medianPoint(points);
    p.color = color(192, 128, 128);
    p.draw();

    graph.draw(points);
  }
}

function windowResized() {
  let newWidth = windowWidth * 0.75;
  let newHeight = windowHeight;
  resizeCanvas(newWidth, newHeight);
  graph.resize(newWidth, newHeight, graphPadding);
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 &&
         x <= width && y <= height;
}

function mousePressed() {
  if (inBounds(mouseX, mouseY)) {
    points.push(new DataPoint(createVector(mouseX, mouseY)));
  }
}

function touchStarted() {
  if (inBounds(mouseX, mouseY)) {
    points.push(new DataPoint(createVector(mouseX, mouseY)));
    return false;
  }
  return true;
}
