// =========================
// CENA: sol
// =========================
// Um disco com degradê e um halo suave em volta. O tamanho acompanha o grave.

function drawSun(level) {
  const c = drawingContext;
  const x = W / 2;
  const y = HORIZON_Y - 40;      // um pouco acima do horizonte
  const r = 110 + level * 40;    // raio base + pulso do grave

  c.save();

  // Halo: degradê radial que vai de opaco no centro a transparente na borda.
  const haloR = r * 2.6;
  const halo = c.createRadialGradient(x, y, r * 0.6, x, y, haloR);
  halo.addColorStop(0, `rgba(${SUN_RGB}, 0.55)`);
  halo.addColorStop(1, `rgba(${SUN_RGB}, 0)`);
  c.fillStyle = halo;
  c.beginPath();
  c.arc(x, y, haloR, 0, Math.PI * 2);
  c.fill();

  // Disco: degradê vertical, amarelo claro em cima e rosa embaixo.
  const disc = c.createLinearGradient(0, y - r, 0, y + r);
  disc.addColorStop(0, '#fff3c4');
  disc.addColorStop(1, '#ff9ecb');
  c.fillStyle = disc;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();

  c.restore();
}