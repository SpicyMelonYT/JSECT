class JSECT {
  constructor() {}
}

JSECT.largeRayLength = 100000000;

// Vector
JSECT.vector = class JSECTVector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  normalize() {
    let { nx, ny } = JSECT.xy.normalize(this.x, this.y);
    this.x = nx;
    this.y = ny;
    return this;
  }

  length() {
    return JSECT.xy.length(this.x, this.y);
  }

  lengthSquared() {
    return JSECT.xy.lengthSquared(this.x, this.y);
  }

  rotate(radian = 0, centerX = 0, centerY = 0) {
    let { x, y } = JSECT.xy.rotate(this.x, this.y, radian, centerX, centerY);
    this.x = x;
    this.y = y;
    return this;
  }

  direction() {
    let direction = JSECT.createDirection(this.x, this.y);
    return direction;
  }

  copy() {
    let vector = JSECT.createVector(this.x, this.y);
    return vector;
  }

  add(vector) {
    let { x, y } = JSECT.xy.add(this.x, this.y, vector.x, vector.y);
    this.x = x;
    this.y = y;
    return this;
  }

  sub(vector) {
    let { x, y } = JSECT.xy.sub(this.x, this.y, vector.x, vector.y);
    this.x = x;
    this.y = y;
    return this;
  }

  mult(vector) {
    let { x, y } = JSECT.xy.mult(this.x, this.y, vector.x, vector.y);
    this.x = x;
    this.y = y;
    return this;
  }

  div(vector) {
    let { x, y } = JSECT.xy.div(this.x, this.y, vector.x, vector.y);
    this.x = x;
    this.y = y;
    return this;
  }

  dot(vector) {
    return JSECT.xy.dot(this.x, this.y, vector.x, vector.y);
  }

  cross(vector) {
    return JSECT.xy.cross(this.x, this.y, vector.x, vector.y);
  }

  distance(vector) {
    return JSECT.distance.vector(this, vector);
  }
};

JSECT.createVector = function (x, y) {
  return new JSECT.vector(x, y);
};

// Direction
JSECT.direction = class JSECTDirection {
  constructor(x = 1, y = 0) {
    this._x = x;
    this._y = y;
    this._nx = 0;
    this._ny = 0;
    this.normalized = false;
    this.update();
  }

  get x() {
    if (this.normalized === false) this.update();
    return this._nx;
  }

  set x(value) {
    this._x = value;
    this.normalized = false;
  }

  get y() {
    if (this.normalized === false) this.update();
    return this._ny;
  }

  set y(value) {
    this._y = value;
    this.normalized = false;
  }

  update() {
    this.normalized = true;
    let { x, y } = JSECT.xy.normalize(this._x, this._y);
    this._nx = x;
    this._ny = y;
  }

  rotate(radian = 0, centerX = 0, centerY = 0) {
    let { x, y } = JSECT.xy.rotate(this.x, this.y, radian, centerX, centerY);
    this.x = x;
    this.y = y;
    return this;
  }

  vector() {
    let vector = JSECT.createVector(this.x, this.y);
    return vector;
  }

  copy() {
    let direction = JSECT.createDirection(this.x, this.y);
    return direction;
  }
};

JSECT.createDirection = function (x, y) {
  return new JSECT.direction(x, y);
};

// Line
JSECT.line = class JSECTLine {
  constructor(ax, ay, bx, by) {
    this.a = JSECT.createVector(ax, ay);
    this.b = JSECT.createVector(bx, by);
  }

  get length() {
    return JSECT.xy.distance(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  get delta() {
    return JSECT.createVector(this.bx - this.ax, this.by - this.ay);
  }

  get direction() {
    return JSECT.createDirection(this.bx - this.ax, this.by - this.ay);
  }

  get ax() {
    return this.a.x;
  }

  set ax(v) {
    this.a.x = v;
  }

  get ay() {
    return this.a.y;
  }

  set ay(v) {
    this.a.y = v;
  }

  get bx() {
    return this.b.x;
  }

  set bx(v) {
    this.b.x = v;
  }

  get by() {
    return this.b.y;
  }

  set by(v) {
    this.b.y = v;
  }

  sampleFactor(factor = 0.5) {
    let delta = this.delta;

    delta.x *= factor;
    delta.y *= factor;

    delta.x += this.a.x;
    delta.y += this.a.y;

    return delta;
  }

  sampleDistance(distance = 1) {
    let direction = this.direction;

    let nx = direction.x * distance;
    let ny = direction.y * distance;

    nx += this.a.x;
    ny += this.a.y;

    return JSECT.createVector(nx, ny);
  }

  center() {
    return this.sample(0.5);
  }

  normal() {
    let direction = this.direction;
    direction.rotate(-Math.PI * 0.5);
    return direction;
  }

  linecast(lines) {
    let intersect;
    let hit, hitLine, hitIndex, distance;
    let closestDistance = Infinity;
    let index = -1;
    for (let line of lines) {
      index++;
      intersect = JSECT.intersect.line(this, line);
      if (intersect) {
        distance = JSECT.distance.vector(intersect, this.origin);
        if (distance < closestDistance) {
          closestDistance = distance;
          hit = intersect;
          hitLine = line;
          hitIndex = index;
        }
      }
    }

    if (hit) {
      return {
        point: hit,
        line: hitLine,
        index: hitIndex,
        distance: closestDistance,
      };
    } else {
      return false;
    }
  }

  linecastAllUnsorted(lines) {
    let hits = [];

    let line, intersect, hit, distance;
    for (let i = 0; i < lines.length; i++) {
      line = lines[i];
      intersect = JSECT.intersect.line(this, line);
      distance = JSECT.distance.vector(intersect, this.origin);

      if (intersect) {
        hit = { point: intersect, line, index: i, distance };
        hits.push(hit);
      }
    }

    return hits;
  }

  linecastAll(lines) {
    let hits = this.linecastAllUnsorted(lines);

    hits.sort((a, b) => {
      return a.distance - b.distance;
    });

    return hits;
  }

  ray() {
    let direction = this.direction;
    let ray = JSECT.createRay(this.ax, this.ay, direction.x, direction.y);
    ray.length = this.length;
    return ray;
  }

  copy() {
    let line = JSECT.createLine(this.ax, this.ay, this.bx, this.by);
    return line;
  }
};

JSECT.createLine = function (ax, ay, bx, by) {
  return new JSECT.line(ax, ay, bx, by);
};

// Ray
JSECT.ray = class JSECTRay {
  constructor(x, y, dx = 1, dy = 0) {
    this.origin = JSECT.createVector(x, y);
    this.direction = JSECT.createDirection(dx, dy);
    this.length = JSECT.xy.length(dx, dy);
  }

  sampleDistance(distance = 1) {
    let nx = this.direction.x * distance;
    let ny = this.direction.y * distance;

    nx += this.origin.x;
    ny += this.origin.y;

    return JSECT.createVector(nx, ny);
  }

  get end() {
    return this.sampleDistance(this.length);
  }

  set end(vector) {
    let nx = vector.x - this.origin.x;
    let ny = vector.y - this.origin.y;

    this.length = JSECT.xy.length(nx, ny);

    this.direction.x = nx;
    this.direction.y = ny;
  }

  raycast(lines, useLength = true) {
    let len = this.length;
    if (useLength === false) {
      this.length = JSECT.largeRayLength;
    }

    let intersect;
    let hit, hitLine, hitIndex, distance;
    let closestDistance = Infinity;
    let index = -1;
    for (let line of lines) {
      index++;
      intersect = JSECT.intersect.rayLine(this, line);
      if (intersect) {
        distance = JSECT.distance.vector(intersect, this.origin);
        if (distance < closestDistance) {
          closestDistance = distance;
          hit = intersect;
          hitLine = line;
          hitIndex = index;
        }
      }
    }

    if (useLength === false) {
      this.length = len;
    }

    if (hit) {
      return {
        point: hit,
        line: hitLine,
        index: hitIndex,
        distance: closestDistance,
      };
    } else {
      return false;
    }
  }

  raycastAllUnsorted(lines, useLength = true) {
    let len = this.length;
    if (useLength === false) {
      this.length = JSECT.largeRayLength;
    }

    let hits = [];

    let line, intersect, hit, distance;
    for (let i = 0; i < lines.length; i++) {
      line = lines[i];
      intersect = JSECT.intersect.rayLine(this, line);
      distance = JSECT.distance.vector(intersect, this.origin);

      if (intersect) {
        hit = { point: intersect, line, index: i, distance };
        hits.push(hit);
      }
    }

    if (useLength === false) {
      this.length = len;
    }
    return hits;
  }

  raycastAll(lines) {
    let hits = this.raycastAllUnsorted(lines);

    hits.sort((a, b) => {
      return a.distance - b.distance;
    });

    return hits;
  }

  dot(ray) {
    return this.direction.dot(ray.direction);
  }

  cross(ray) {
    return this.direction.dot(ray.direction);
  }

  aim(x, y) {
    this.direction.x = x - this.origin.x;
    this.direction.y = y - this.origin.y;
    return this;
  }

  line() {
    let sample = this.sampleDistance(this.length);
    let line = JSECT.createLine(
      this.origin.x,
      this.origin.y,
      sample.x,
      sample.y
    );
    return line;
  }

  copy() {
    let ray = JSECT.createRay(
      this.origin.x,
      this.origin.y,
      this.direction.x,
      this.direction.y
    );
    return ray;
  }
};

JSECT.createRay = function (x, y, dx, dy) {
  return new JSECT.ray(x, y, dx, dy);
};

// Math
JSECT.math = class JSECTMath {
  static clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
  }
};

// XY
JSECT.xy = class JSECTXY {
  static normalize(x, y) {
    let len = JSECT.xy.length(x, y);
    x = x / len;
    y = y / len;
    return { x, y };
  }

  static length(x, y) {
    return sqrt(JSECT.xy.lengthSquared(x, y));
  }

  static lengthSquared(x, y) {
    return x * x + y * y;
  }

  static distance(ax, ay, bx, by) {
    return JSECT.xy.length(ax - bx, ay - by);
  }

  static distanceSquared(ax, ay, bx, by) {
    return JSECT.xy.lengthSquared(ax - bx, ay - by);
  }

  static rotate(x, y, radian = 0, centerX = 0, centerY = 0) {
    let cx = x - centerX;
    let cy = y - centerY;

    let cosT = Math.cos(radian);
    let sinT = Math.sin(radian);

    let nx = cx * cosT - cy * sinT;
    let ny = cx * sinT + cy * cosT;

    return { x: nx, y: ny };
  }

  static add(ax, ay, bx, by) {
    return { x: ax + bx, y: ay + by };
  }

  static sub(ax, ay, bx, by) {
    return { x: ax - bx, y: ay - by };
  }

  static mult(ax, ay, bx, by) {
    return { x: ax * bx, y: ay * by };
  }

  static div(ax, ay, bx, by) {
    return { x: ax / bx, y: ay / by };
  }

  static dot(ax, ay, bx, by) {
    return ax * bx + ay * by;
  }

  static cross(ax, ay, bx, by) {
    return ax * bx - ay * by;
  }
};

// Intersect
JSECT.intersect = class JSECTIntersect {
  static lineXY(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      let test = 0 <= lambda && lambda <= 1 && 0 <= gamma && gamma <= 1;
      let xpos = a + (c - a) * lambda;
      let ypos = b + (d - b) * lambda;
      if (test == true) {
        return {
          x: xpos,
          y: ypos,
        };
      } else {
        return false;
      }
    }
  }

  static line(lineA, lineB) {
    let intersect = JSECT.intersect.lineXY(
      lineA.a.x,
      lineA.a.y,
      lineA.b.x,
      lineA.b.y,
      lineB.a.x,
      lineB.a.y,
      lineB.b.x,
      lineB.b.y
    );

    if (intersect) {
      return JSECT.createVector(intersect.x, intersect.y);
    } else {
      return false;
    }
  }

  static rayLine(ray, line) {
    let lineA = ray.line();
    return JSECT.intersect.line(lineA, line);
  }

  static ray(rayA, rayB) {
    let lineA = rayA.line();
    let lineB = rayB.line();
    return JSECT.intersect.line(lineA, lineB);
  }
};

// Distance
JSECT.distance = class JSECTDIstance {
  static vector(a, b) {
    return JSECT.xy.distance(a.x, a.y, b.x, b.y);
  }

  static vectorLine(vector, line) {
    let n = JSECT.project.vectorLine(vector, line);
    return JSECT.distance.vector(vector, n);
  }

  static vectorLineContinuous(vector, line) {
    let n = JSECT.project.vectorLineContinuous(vector, line);
    return JSECT.distance.vector(vector, n);
  }

  static vectorRay(vector, ray) {
    let n = JSECT.project.vectorRay(vector, ray);
    return JSECT.distance.vector(vector, n);
  }

  static vectorRayContinuous(vector, ray) {
    let n = JSECT.project.vectorRayContinuous(vector, ray);
    return JSECT.distance.vector(vector, n);
  }

  static line(lineA, lineB) {
    let projection = JSECT.project.line(lineA, lineB);
    let aa = lineA.a.distance(projection.aa);
    let ab = lineA.b.distance(projection.ab);
    let ba = lineB.a.distance(projection.ba);
    let bb = lineB.b.distance(projection.bb);

    return JSECT.array.min([aa, ab, ba, bb]);
  }
};

// Project
JSECT.project = class JSECTProject {
  static vectorLine(vector, line) {
    d1 = line.b.copy().sub(line.a).normalize();
    d2 = vector.copy.sub(line.a);

    d1.mult(d2.dot(d1));

    return line.a.copy().add(d1);
  }

  static vectorLineContinuous(vector, line) {
    d1 = line.b.copy().sub(line.a);
    d2 = vector.copy().sub(line.a);
    l1 = d1.length();

    dotp = JSECT.math.clamp(d2.dot(d1.normalize()), 0, l1);

    return line.a.copy().add(d1.mult(dotp));
  }

  static vectorRay(vector, ray, rayLength = JSECT.largeRayLength) {
    let line = ray.line(rayLength);
    return JSECT.project.vectorLine(vector, line);
  }

  static vectorRayContinuous(vector, ray, rayLength = JSECT.largeRayLength) {
    let line = ray.line(rayLength);
    return JSECT.project.vectorLineContinuous(vector, line);
  }

  static line(lineA, lineB) {
    let aa = JSECT.project.vectorLine(lineA.a, lineB);
    let ab = JSECT.project.vectorLine(lineA.b, lineB);
    let ba = JSECT.project.vectorLine(lineB.a, lineA);
    let bb = JSECT.project.vectorLine(lineB.b, lineA);
    return { aa, ab, ba, bb };
  }

  static lineContinuous(lineA, lineB) {
    let aa = JSECT.project.vectorLineContinuous(lineA.a, lineB);
    let ab = JSECT.project.vectorLineContinuous(lineA.b, lineB);
    let ba = JSECT.project.vectorLineContinuous(lineB.a, lineA);
    let bb = JSECT.project.vectorLineContinuous(lineB.b, lineA);
    return { aa, ab, ba, bb };
  }
};

// Array
JSECT.array = class JSECTArray {
  static min(array) {
    let min = Infinity;
    for (let v of array) {
      if (v < min) {
        min = v;
      }
    }

    return min;
  }

  static max(array) {
    let max = -Infinity;
    for (let v of array) {
      if (v > max) {
        max = v;
      }
    }

    return max;
  }

  static random(array) {
    return array[JSECT.array.randomIndex(array)];
  }

  static randomIndex(array) {
    return Math.floor(Math.random() * array.length);
  }
};

JSECT.extentions = class JSECTExtentions {
  static extend() {
    JSECT.extentions.array();
  }

  static array() {
    Array.prototype.random = function () {
      return JSECT.array.random(this);
    };

    Array.prototype.randomIndex = function () {
      return JSECT.array.randomIndex(this);
    };
  }
};

JSECT.extentions.extend();
