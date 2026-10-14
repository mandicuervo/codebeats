// CENA: sol
// Um disco com degradê e um halo suave em volta. O tamanho acompanha o grave.

function drawSun(level) {
  const c = drawingContext;
  const x = W / 2;
  const y = -200;                   // no topo; só a metade inferior aparece no canvas
  const r = 500 + level * 150;    // raio base + pulso do grave

  c.save();

  // Halo: degradê radial que vai de opaco no centro a transparente na borda.
  const haloR = r * 2.6;
  const halo = c.createRadialGradient(x, y, r * 0.6, x, y, haloR);
  halo.addColorStop(0, `rgba(${SUN_RGB}, 0.25)`);
  halo.addColorStop(1, `rgba(${SUN_RGB}, 0)`);
  c.fillStyle = halo;
  c.beginPath();
  c.arc(x, y, haloR, 0, Math.PI * 2);
  c.fill();

  // O degradê radial deixa a borda do disco transparente e menos marcada.
  const disc = c.createRadialGradient(x, y, 0, x, y, r);
  disc.addColorStop(0, 'rgba(255, 243, 196, 0.8)');
  disc.addColorStop(0.65, 'rgba(255, 224, 232, 0.7)');
  disc.addColorStop(0.9, 'rgba(255, 158, 244, 0.35)');
  disc.addColorStop(1, 'rgba(255, 158, 244, 0)');
  c.fillStyle = disc;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();

  c.restore();
}