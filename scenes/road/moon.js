// Lua cheia em tons naturais, ponto de fuga da estrada.
const MOON_DESCENT_SPEED = 3; // pixels por segundo; aumente para a Lua descer mais rápido
const MOON_HORIZON_GAP = -45; // pixels da base da Lua para dentro do horizonte; negativo faz a Lua se pôr
const MOON_BASE_RADIUS = 178;
const MOON_IMAGE_SIZE = 2.5;
const DAISY_SIZE_MULTIPLIER = 1.5; // tamanho da margarida em relação à Lua
const DAISY_OPACITY = 0.20;
const DAISY_ROTATION_PERIOD = 60; // segundos por volta completa
let moonImage;
let daisyImage;
let moonFlash = 0;
let moonY = H * 0.28;
let daisyRotation = 0;

function preloadMoonImage() {
  moonImage = loadImage('assets/road/moon.png');
  daisyImage = loadImage('assets/road/daisy-petals.png');
}

function igniteMoon(strength) {
  moonFlash = Math.max(moonFlash, strength);
}

function drawMoon(dt) {
  const c = drawingContext;
  const x = W / 2;
  const flash = moonFlash;
  const radius = MOON_BASE_RADIUS + flash * 68;
  const imageSize = radius * MOON_IMAGE_SIZE;
  const restingY = HORIZON_Y - (MOON_BASE_RADIUS * MOON_IMAGE_SIZE) / 2 - MOON_HORIZON_GAP;
  moonY = Math.min(moonY + dt * MOON_DESCENT_SPEED, restingY);
  daisyRotation = (daisyRotation + dt * TWO_PI / DAISY_ROTATION_PERIOD) % TWO_PI;
  const y = moonY;
  moonFlash *= Math.exp(-dt * 3.2);

  c.save();
  const haloR = radius * 2.2;
  const halo = c.createRadialGradient(x, y, radius * 0.45, x, y, haloR);
  halo.addColorStop(0, `rgba(${MOON_RGB}, ${0.19 + flash * 0.38})`);
  halo.addColorStop(1, `rgba(${MOON_RGB}, 0)`);
  c.fillStyle = halo;
  c.fillRect(x - haloR, y - haloR, haloR * 2, haloR * 2);

  const daisySize = MOON_BASE_RADIUS * MOON_IMAGE_SIZE * DAISY_SIZE_MULTIPLIER;
  c.save();
  c.translate(x, y);
  c.rotate(daisyRotation);
  c.globalAlpha = DAISY_OPACITY;
  c.drawImage(daisyImage.canvas, -daisySize / 2, -daisySize / 2, daisySize, daisySize);
  c.restore();
  image(moonImage, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize);
  c.restore();
}