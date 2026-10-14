// CENA dreamy: GOTAS
// As gotas nascem de pulsos do som médio.

// Gotas ativas. Cada gota é um objeto com posição, velocidade e vida própria.
const drops = [];

// Cria um grupo de gotas. strength = energia do médio (mais forte, mais gotas).
// pitch = altura da nota, de 0 a 1, convertida aqui em posição horizontal.
function spawnDrops(strength, pitch) {
  const px = map(pitch, 0, 1, W * (0.5 - PITCH_SPREAD / 2), W * (0.5 + PITCH_SPREAD / 2));
  const n = 1 + Math.floor(Math.min(1, strength * 6) * 2); // de 1 a 3 gotas
  for (let i = 0; i < n; i++) drops.push(makeDrop(px));

  // Limite de segurança: descarta as mais antigas se houver gotas demais.
  if (drops.length > 150) drops.splice(0, drops.length - 150);
}

// Desenha um halo de luz: um círculo que vai da cor (centro) até transparente
// (borda).
// Usa save/restore para não deixar o fillStyle alterado para quem vem depois.
function glow(x, y, r, a, rgb = '255, 255, 255') {
  const c = drawingContext;
  c.save();
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${a})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`); // mesma cor com alfa 0, sem borda cinza
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.restore();
}

// Desenha as gotas. O save/restore é necessário porque drawDrops altera
// strokeStyle, lineWidth e lineCap do contexto, e sem restaurar o círculo
// desenhado depois pelo p5 sairia com esse contorno.
function drawSparkle(dt) {
  const c = drawingContext;
  c.save();
  drawDrops(dt);
  c.restore();
}

// Cria uma gota perto da coluna cx, no alto da tela.
//   vy      velocidade de queda, em pixels por segundo
//   size    tamanho do núcleo
//   maxLife tempo de vida, em segundos
function makeDrop(cx) {
  return {
    x: lerp(Math.random() * W, cx, DROP_PITCH_WEIGHT), // mistura sorteio na tela toda com a posição da nota
    y: Math.random() * H * 0.45,
    vy: 120 + Math.random() * 220,
    size: 5 + Math.random() * 9,
    life: 0,
    maxLife: 1.4 + Math.random() * 1.2,
  };
}

// Move e desenha cada gota. dt = duração do frame em segundos, para a
// velocidade não depender do FPS. Percorre de trás para frente para poder
// remover itens do array durante o laço sem pular nenhum.
function drawDrops(dt) {
  const c = drawingContext;
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += dt;
    d.y += d.vy * dt;

    // k = progresso da vida, de 0 a 1. Fim da vida ou fora da tela: remove.
    const k = d.life / d.maxLife;
    if (k >= 1 || d.y > H) { drops.splice(i, 1); continue; }

    // Opacidade: aparece rápido (12 x vida), some devagar (1 - k) e cintila.
    const a = (1 - k) * Math.min(1, d.life * 12) * (0.75 + 0.25 * Math.sin(d.life * 30 + d.x));

    // Rastro: linha vertical com degradê, transparente em cima e colorida embaixo.
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

    // Cabeça da gota: halo colorido grande e núcleo branco pequeno.
    glow(d.x, d.y, d.size * 4, a * 0.6, DROP_RGB);
    glow(d.x, d.y, d.size * 1.2, a);
  }
}