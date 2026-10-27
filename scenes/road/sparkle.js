// Estrelas com brilho suave e cintilação individual.
const stars = [];
const comets = [];
const imageStars = [];
const illustratedStars = [];
const PASTEL_STAR_COLORS = [
  '184, 105, 144',
  '127, 100, 177',
  '83, 129, 174',
  '83, 145, 128',
  '180, 137, 80',
];
const STAR_OUTLINE_COLORS = [
  '72, 39, 67',
  '48, 41, 81',
  '36, 57, 78',
  '37, 67, 63',
  '78, 55, 37',
];
let starImage;

function preloadStarImage() {
  starImage = loadImage('assets/road/star.png');
}

function createStars() {
  randomSeed(37);
  for (let i = 0; i < 180; i++) {
    stars.push({
      x: random(W),
      y: random(HORIZON_Y + 50),
      size: random(0.7, 2.4),
      phase: random(TWO_PI),
      speed: random(0.5, 1.8),
      drift: random(3, 15) * (random() < 0.5 ? -1 : 1),
      alpha: random(0.35, 0.95),
    });
  }

  for (let i = 0; i < 14; i++) {
    imageStars.push({
      x: random(20, W - 20),
      y: random(25, HORIZON_Y - 35),
      size: random(25, 40),
      phase: random(TWO_PI),
      speed: random(0.45, 1.1),
      drift: random(2, 8) * (random() < 0.5 ? -1 : 1),
      alpha: random(0.55, 0.85),
    });
  }

  for (let i = 0; i < 16; i++) {
    const points = [];
    const pointCount = Math.floor(random(4, 7));
    const angleOffset = random(TWO_PI);
    for (let point = 0; point < pointCount * 2; point++) {
      const angle = angleOffset + point * Math.PI / pointCount + random(-0.13, 0.13);
      const radius = point % 2 === 0
        ? random(0.78, 1.12)
        : random(0.28, 0.52);
      points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }

    illustratedStars.push({
      x: random(18, W - 18),
      y: random(20, HORIZON_Y - 35),
      size: i < 4 ? random(15, 20) : random(7, 13),
      color: PASTEL_STAR_COLORS[i % PASTEL_STAR_COLORS.length],
      outline: STAR_OUTLINE_COLORS[i % STAR_OUTLINE_COLORS.length],
      points,
      phase: random(TWO_PI),
      speed: random(0.6, 1.4),
      drift: random(1, 5) * (random() < 0.5 ? -1 : 1),
      rotation: random(TWO_PI),
      spin: random(-0.12, 0.12),
      alpha: random(0.72, 0.96),
      pulse: 0,
    });
  }
}

function spawnComet() {
  const speed = random(950, 1450);
  comets.push({
    x: random(-W * 0.15, W * 0.42),
    y: random(25, HORIZON_Y * 0.62),
    vx: speed,
    vy: random(180, 340),
    life: 0,
    duration: 0.7,
    tail: random(110, 190),
  });
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

function drawSparkle(dt, t, trebleHit = false) {
  const c = drawingContext;
  c.save();
  c.globalCompositeOperation = 'screen';
  for (const star of stars) {
    star.x = (star.x + star.drift * dt + W) % W;
    const twinkle = 0.58 + Math.sin(t * star.speed + star.phase) * 0.3;
    c.fillStyle = `rgba(255, 235, 255, ${star.alpha * twinkle})`;
    c.beginPath();
    c.arc(star.x, star.y, star.size, 0, TWO_PI);
    c.fill();
    if (star.size > 2.2) glow(star.x, star.y, star.size * 5, twinkle * 0.2, NEON_BLUE);
  }

  for (const star of imageStars) {
    star.x = (star.x + star.drift * dt + W) % W;
    const twinkle = 0.78 + Math.sin(t * star.speed + star.phase) * 0.16;
    const size = star.size * (0.94 + twinkle * 0.08);
    c.globalAlpha = star.alpha * twinkle;
    c.drawImage(starImage.canvas, star.x - size / 2, star.y - size / 2, size, size);
  }
  c.globalAlpha = 1;

  for (const star of illustratedStars) {
    star.x = (star.x + star.drift * dt + W) % W;
    star.rotation += star.spin * dt;
    star.pulse = trebleHit ? 1 : star.pulse * Math.exp(-dt * 8);
    const radius = star.size * (1 + star.pulse * 0.3);

    c.save();
    c.translate(star.x, star.y);
    c.rotate(star.rotation);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = star.alpha;
    c.lineJoin = 'round';
    c.lineWidth = Math.max(1.25, star.size * 0.14);
    c.strokeStyle = `rgba(${star.outline}, 0.98)`;
    c.fillStyle = `rgba(${star.color}, 0.96)`;
    c.beginPath();
    for (let i = 0; i < star.points.length; i++) {
      const x = star.points[i].x * radius;
      const y = star.points[i].y * radius;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.fill();
    c.stroke();

    c.fillStyle = 'rgba(255, 239, 248, 0.32)';
    c.beginPath();
    c.arc(-radius * 0.16, -radius * 0.18, radius * 0.08, 0, TWO_PI);
    c.fill();
    c.restore();
  }

  for (let i = comets.length - 1; i >= 0; i--) {
    const comet = comets[i];
    comet.life += dt;
    comet.x += comet.vx * dt;
    comet.y += comet.vy * dt;
    if (comet.life >= comet.duration || comet.x - comet.tail > W) {
      comets.splice(i, 1);
      continue;
    }

    const fade = Math.min(1, (comet.duration - comet.life) * 3);
    const tailX = comet.x - comet.tail;
    const tailY = comet.y - comet.tail * comet.vy / comet.vx;
    const trail = c.createLinearGradient(tailX, tailY, comet.x, comet.y);
    trail.addColorStop(0, 'rgba(255, 235, 190, 0)');
    trail.addColorStop(1, `rgba(255, 239, 205, ${fade * 0.9})`);
    c.strokeStyle = trail;
    c.lineWidth = 2.5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(tailX, tailY);
    c.lineTo(comet.x, comet.y);
    c.stroke();
    glow(comet.x, comet.y, 13, fade * 0.75, '255, 238, 205');
    c.fillStyle = `rgba(255, 255, 244, ${fade})`;
    c.beginPath();
    c.arc(comet.x, comet.y, 2.5, 0, TWO_PI);
    c.fill();
  }
  c.restore();
}