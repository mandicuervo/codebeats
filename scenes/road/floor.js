// Estrada em perspectiva: as faixas e reflexos avançam até quem assiste.
let floorScroll = 0;
let roadWarp = 0;
let nextWarpDirection = 1;
const ROAD_MARKS = 11;
const ROAD_CURVE_SEGMENTS = 40;

function roadHalfWidth(p) {
  return lerp(12, W * 0.44, Math.pow(p, 1.12));
}

function roadCenterX(p) {
  const sBend = Math.sin(p * Math.PI * 2) * Math.sin(p * Math.PI);
  return W / 2 + roadWarp * sBend;
}

function igniteRoadWarp(strength = 1) {
  roadWarp = nextWarpDirection * 110 * strength;
  nextWarpDirection *= -1;
}

function roadY(p) {
  return HORIZON_Y + (H - HORIZON_Y) * p * p;
}

function drawFloor(dt, level) {
  const c = drawingContext;
  const horizon = HORIZON_Y;
  roadWarp *= Math.exp(-dt * 2.8);
  const road = c.createLinearGradient(0, horizon, 0, H);
  road.addColorStop(0, `rgb(${ROAD_TOP_RGB})`);
  road.addColorStop(1, `rgb(${ROAD_BOTTOM_RGB})`);

  c.save();
  const ground = c.createLinearGradient(0, horizon - 80, 0, horizon + 100);
  ground.addColorStop(0, 'rgba(20, 12, 36, 0)');
  ground.addColorStop(0.55, 'rgba(20, 12, 36, 0.35)');
  ground.addColorStop(1, 'rgba(20, 12, 36, 0.92)');
  c.fillStyle = ground;
  c.fillRect(0, horizon - 80, W, H - horizon + 80);

  c.beginPath();
  for (let i = 0; i <= ROAD_CURVE_SEGMENTS; i++) {
    const p = i / ROAD_CURVE_SEGMENTS;
    const x = roadCenterX(p) - roadHalfWidth(p);
    if (i === 0) c.moveTo(x, roadY(p));
    else c.lineTo(x, roadY(p));
  }
  for (let i = ROAD_CURVE_SEGMENTS; i >= 0; i--) {
    const p = i / ROAD_CURVE_SEGMENTS;
    c.lineTo(roadCenterX(p) + roadHalfWidth(p), roadY(p));
  }
  c.closePath();
  c.fillStyle = road;
  c.fill();

  const reflection = c.createLinearGradient(0, horizon, 0, H);
  reflection.addColorStop(0, 'rgba(255, 106, 224, 0)');
  reflection.addColorStop(0.7, 'rgba(255, 70, 203, 0.035)');
  reflection.addColorStop(1, 'rgba(255, 70, 203, 0.13)');
  c.fillStyle = reflection;
  c.fill();

  floorScroll = (floorScroll + dt * (0.18 + level * 0.3)) % 1;

  for (let i = 0; i < ROAD_MARKS; i++) {
    const p = (i / ROAD_MARKS + floorScroll) % 1;
    if (p < 0.04) continue;

    const endP = Math.min(1, p + 0.035 + p * 0.12);
    const y1 = roadY(p);
    const y2 = roadY(endP);
    const width = 1.5 + p * 9;
    const x1 = roadCenterX(p);
    const x2 = roadCenterX(endP);
    const alpha = 0.32 + p * 0.55 + level * 0.12;

    c.beginPath();
    c.moveTo(x1 - width * 2, y1);
    c.lineTo(x1 + width * 2, y1);
    c.lineTo(x2 + width * 2, y2);
    c.lineTo(x2 - width * 2, y2);
    c.closePath();
    c.fillStyle = `rgba(${ROAD_MARK_GLOW_RGB}, ${alpha * 0.22})`;
    c.shadowColor = `rgba(${ROAD_MARK_GLOW_RGB}, 0.9)`;
    c.shadowBlur = 12;
    c.fill();
    c.shadowBlur = 0;

    c.beginPath();
    c.moveTo(x1 - width / 2, y1);
    c.lineTo(x1 + width / 2, y1);
    c.lineTo(x2 + width / 2, y2);
    c.lineTo(x2 - width / 2, y2);
    c.closePath();
    c.fillStyle = `rgba(${ROAD_MARK_RGB}, ${Math.min(1, alpha + 0.12)})`;
    c.shadowColor = `rgba(${ROAD_MARK_GLOW_RGB}, 0.85)`;
    c.shadowBlur = 7;
    c.fill();
    c.shadowBlur = 0;
  }

  drawRail(c, -1);
  drawRail(c, 1);
  c.restore();
}

function drawRail(c, side) {
  for (const offset of [0, 12]) {
    c.beginPath();
    for (let i = 0; i <= ROAD_CURVE_SEGMENTS; i++) {
      const p = i / ROAD_CURVE_SEGMENTS;
      const x = roadCenterX(p) + side * (roadHalfWidth(p) + offset * p);
      const y = roadY(p);
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }

    const rail = c.createLinearGradient(0, HORIZON_Y, 0, H);
    rail.addColorStop(0, `rgba(${NEON_LILAC}, 0.12)`);
    rail.addColorStop(0.38, `rgba(${NEON_BLUE}, 0.68)`);
    rail.addColorStop(0.72, `rgba(${NEON_MINT}, 0.72)`);
    rail.addColorStop(1, `rgba(${ROAD_EDGE_RGB}, 1)`);
    c.strokeStyle = rail;
    c.lineWidth = offset === 0 ? 1.5 : 3;
    c.shadowColor = `rgba(${offset === 0 ? NEON_BLUE : ROAD_EDGE_RGB}, 0.7)`;
    c.shadowBlur = offset === 0 ? 8 : 15;
    c.stroke();
  }
  c.shadowBlur = 0;
}
