function makeDetector(ratio, floor, cooldown) {
  return { avg: 0.01, last: 0, ratio, floor, cooldown };
}

function detect(d, value, now) {
  const hit = value > d.avg * d.ratio + d.floor && now - d.last > d.cooldown;
  d.avg = lerp(d.avg, value, 0.08);
  if (hit) d.last = now;
  return hit;
}

const midDet = makeDetector(1.8, 0.004, 0.07);
const trebleDet = makeDetector(1.8, 0.004, 0.07);