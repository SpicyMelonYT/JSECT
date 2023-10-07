function setup() {
  createCanvas(800, 800);

  l1 = JSECT.createLine(200, 200, 600, 600);
  l2 = JSECT.createLine(100, 200, 700, 600);

  r1 = JSECT.createRay(100, 700, 100, 0);

  points = [];
}

function draw() {
  background(51);

  r1.aim(mouseX, mouseY);

  let hit = r1.raycast([l1, l2], false);
  if (hit) {
    r1.length = hit.distance;
    points.push(hit.point);
    if (points.length > 200) {
      points.splice(0, 1);
    }
  } else {
    r1.length = JSECT.largeRayLength;
  }

  line(r1.origin.x, r1.origin.y, r1.end.x, r1.end.y);

  // line(l1.ax, l1.ay, l1.bx, l1.by);
  // line(l2.ax, l2.ay, l2.bx, l2.by);

  for (let p of points) {
    circle(p.x, p.y, 5);
  }
}
