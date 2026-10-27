// Postes de luz se aproximam em ritmo contínuo, reforçando o movimento da câmera.
let lampScroll = 0;
let lampFlash = 0;

function pulseLamps(strength = 1) {
  lampFlash = Math.max(lampFlash, strength);
}

function drawRoadsideLights(dt, level) {
  const c = drawingContext;
  lampScroll = (lampScroll + dt * (0.12 + level * 0.18)) % 1;
  lampFlash *= Math.exp(-dt * 6);
  c.save();

  for (let i = 0; i < 7; i++) {
    const p = (i / 7 + lampScroll) % 1;
    if (p < 0.06) continue;
    const y = roadY(p);
    const sideOffset = roadHalfWidth(p) + 10 + p * 18;
    const height = 14 + Math.pow(p, 1.5) * 178;
    const poleWidth = 1 + p * 3;

    for (const side of [-1, 1]) {
      const x = roadCenterX(p) + side * sideOffset;
      const arm = Math.max(4, height * 0.22);
      const headX = x - side * arm;
      const headY = y - height;

      c.strokeStyle = `rgba(33, 23, 49, ${0.65 + p * 0.3})`;
      c.lineWidth = poleWidth + 2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, headY);
      c.lineTo(headX, headY);
      c.stroke();

      c.strokeStyle = `rgba(${NEON_PINK}, ${0.35 + p * 0.55})`;
      c.lineWidth = Math.max(1, poleWidth * 0.55);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, headY);
      c.lineTo(headX, headY);
      c.stroke();

      const lampRadius = 3 + p * 7;
      glow(headX, headY, lampRadius * (5 + lampFlash * 4), Math.min(1, 0.14 + p * 0.2 + lampFlash * 0.85), NEON_PINK);
      c.fillStyle = `rgba(255, ${Math.floor(150 + p * 80 + lampFlash * 25)}, 239, ${Math.min(1, 0.55 + p * 0.25 + lampFlash * 0.2)})`;
      c.fillRect(
        headX - lampRadius * (1 + lampFlash * 0.12),
        headY - lampRadius * 0.25,
        lampRadius * 2 * (1 + lampFlash * 0.12),
        lampRadius * 0.55,
      );
    }
  }

  c.restore();
}