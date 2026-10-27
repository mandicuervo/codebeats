// CENA: road
// Contrato com o motor: sceneSetup() roda uma vez e sceneDraw(f) roda a cada frame.

let level = 0;
let lastCometAt = -Infinity;

function preload() {
  preloadMoonImage();
  preloadStarImage();
}

function sceneSetup() {
  noiseDetail(4, 0.55);
  sky = createGraphics(SKY_WIDTH, SKY_HEIGHT);
  sky.pixelDensity(1);
  starImage.resize(48, 48);
  createStars();
}

function sceneDraw(f) {
  paintSky(f.t);
  image(sky, 0, 0, W, H);

  level = lerp(level, f.bass, 0.12);

  if (f.bassHit) {
    igniteMoon(0.9 + Math.min(f.bass * 2, 0.1));
    igniteGlitch(0.45);
    igniteRoadWarp(1);
    if (f.t - lastCometAt >= 10) {
      spawnComet();
      lastCometAt = f.t;
    }
  }
  if (f.trebleHit) {
    pulseLamps(1);
  }

  applyGlitch();
  drawMoon(f.dt);
  drawFloor(f.dt, level);
  drawRoadsideLights(f.dt, level);
  drawSparkle(f.dt, f.t, f.trebleHit);
  if (f.bassDebugEnabled) drawBassDebug(f);
}

let lastBassHit = -Infinity;

function drawBassDebug(f) {
  if (f.bassHit) lastBassHit = f.t;

  const c = drawingContext;
  const x = 20;
  const y = 20;
  const width = 300;
  const recentHit = f.t - lastBassHit < 0.25;
  const blocked = f.bass > f.bassThreshold && f.bassCooldownRemaining > 0;
  const meterMax = 0.08;

  c.save();
  c.fillStyle = 'rgba(7, 5, 18, 0.88)';
  c.fillRect(x, y, width, 105);
  c.font = '16px monospace';
  c.textBaseline = 'top';
  c.fillStyle = '#ffffff';
  c.fillText('GRAVE 40-250 Hz  [B fecha]', x + 12, y + 10);

  c.fillStyle = '#3a334a';
  c.fillRect(x + 12, y + 37, width - 24, 12);
  c.fillStyle = '#ff56d2';
  c.fillRect(x + 12, y + 37, (width - 24) * Math.min(1, f.bass / meterMax), 12);
  c.fillStyle = '#ffffff';
  const thresholdX = x + 12 + (width - 24) * Math.min(1, f.bassThreshold / meterMax);
  c.fillRect(thresholdX - 1, y + 33, 2, 20);

  c.font = '13px monospace';
  c.fillText(`energia ${f.bass.toFixed(4)}  limite ${f.bassThreshold.toFixed(4)}`, x + 12, y + 58);
  c.fillStyle = recentHit ? '#7dffb2' : blocked ? '#ffd36e' : '#c9c4d6';
  const status = recentHit
    ? 'PULSO detectado'
    : blocked
      ? `ACIMA do limite, bloqueado ${f.bassCooldownRemaining.toFixed(2)}s`
      : 'sem pulso';
  c.fillText(status, x + 12, y + 79);
  c.restore();
}
