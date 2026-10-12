const drops = [];

const glints = Array.from({ length: 28 }, () => ({
  flash: 0,
  x: Math.random() * W,
  y: Math.random() * H * 0.6,
  r: 14 + Math.random() * 26,
  speed: 0.6 + Math.random() * 1.4,
  phase: Math.random() * Math.PI * 2,
}));

function spawnDrops(strength, pitch) {
  const px = map(pitch, 0, 1, W * (0.5 - PITCH_SPREAD / 2), W * (0.5 + PITCH_SPREAD / 2));
  const n = 2 + Math.floor(Math.min(1, strength * 6) * 5);
  for (let i = 0; i < n; i++) drops.push(makeDrop(px));
  if (drops.length > 150) drops.splice(0, drops.length - 150);
}

function igniteGlints() {
  for (const g of glints) if (Math.random() < 0.35) g.flash = 1;
}

function glow(x, y, r, a, rgb = '255, 255, 255') {
  const c = drawingContext;
  c.save();
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${a})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.restore();
}

function drawGlints() {
  for (const g of glints) {
    g.flash *= 0.93;
    if (g.flash < 0.03) continue;
    glow(g.x, g.y, g.r * (1.2 + g.flash), g.flash * 0.8, STAR_RGB);
    glow(g.x, g.y, g.r * 0.3, g.flash);
  }
}

function drawSparkle(dt) {
  const c = drawingContext;
  c.save();
  drawGlints();
  drawDrops(dt);
  c.restore();
}

function makeDrop(cx) {
  return {
    x: cx + (Math.random() - 0.5) * 90,
    y: Math.random() * H * 0.45,
    vy: 120 + Math.random() * 220,
    size: 5 + Math.random() * 9,
    life: 0,
    maxLife: 1.4 + Math.random() * 1.2,
  };
}

function drawDrops(dt) {
  const c = drawingContext;
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += dt;
    d.y += d.vy * dt;
    const k = d.life / d.maxLife;
    if (k >= 1 || d.y > H) { drops.splice(i, 1); continue; }
    const a = (1 - k) * Math.min(1, d.life * 12) * (0.75 + 0.25 * Math.sin(d.life * 30 + d.x));
    const tail = d.vy * 0.22;
    const g = c.createLinearGradient(d.x, d.y - tail, d.x, d.y);
    g.addColorStop(0, `rgba(${DROP_RGB}, 0)`);
    g.addColorStop(1, `rgba(${DROP_RGB}, ${a * 0.7})`);
    c.strokeStyle = g;
    c.lineWidth = d.size * 0.35;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(d.x, d.y - tail);
    c.lineTo(d.x, d.y);
    c.stroke();
    glow(d.x, d.y, d.size * 4, a * 0.6, DROP_RGB);
    glow(d.x, d.y, d.size * 1.2, a);
  }
}