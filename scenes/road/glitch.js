// CENA: glitch
// Fatias horizontais da imagem deslocadas de lado, por uma fração de segundo.
// É um passo de pós-processamento: roda DEPOIS de tudo ter sido desenhado.

// Ajustes do efeito, todos aqui para mexer fácil.
const GLITCH = {
  decay: 0.9,        // quanto da força sobra a cada frame (mais perto de 1 dura mais)
  minSlices: 8,      // fatias mínimas por frame
  extraSlices: 12,   // fatias a mais no glitch máximo
  minH: 10,          // altura mínima de cada fatia, em pixels
  maxH: 120,         // altura máxima
  maxShift: 80,     // deslocamento máximo para cada lado, em pixels
};

// Intensidade do glitch: 0 = nenhum, 1 = máximo. Decai sozinha, como o doorFlash.
let glitchAmt = 0;

// Cópia do frame, usada como fonte das fatias (criada na primeira vez que precisa).
let glitchBuf = null;

// Chamada quando acontece o evento que deve causar glitch.
// Math.max evita que um glitch fraco reduza um que já esteja mais forte.
function igniteGlitch(strength = 1) {
  glitchAmt = Math.max(glitchAmt, strength);
}

// Tira uma cópia do canvas principal para o buffer.
function snapshotFrame() {
  if (!glitchBuf) {
    glitchBuf = document.createElement('canvas');
    glitchBuf.width = drawingContext.canvas.width;
    glitchBuf.height = drawingContext.canvas.height;
  }
  glitchBuf.getContext('2d').drawImage(drawingContext.canvas, 0, 0);
}

// Aplica o glitch no frame atual. Chamar por último em sceneDraw.
function applyGlitch() {
  glitchAmt *= GLITCH.decay;
  if (glitchAmt < 0.05) return;     // apagado: não gasta nada

  snapshotFrame();

  const c = drawingContext;
  const scale = c.canvas.width / W;
  const slices = GLITCH.minSlices + Math.floor(glitchAmt * GLITCH.extraSlices);
  for (let i = 0; i < slices; i++) {
    const h = GLITCH.minH + Math.random() * (GLITCH.maxH - GLITCH.minH);
    const y = Math.random() * (H - h);
    const dx = Math.round((Math.random() - 0.5) * 2 * GLITCH.maxShift * glitchAmt);
    c.drawImage(glitchBuf, 0, y * scale, W * scale, h * scale, dx, y, W, h);
  }
}

// TESTE: aperte G para disparar o glitch na hora, sem esperar um prato.
// Pode ser removido depois de ajustar o efeito.
window.addEventListener('keydown', (e) => {
  if (e.key === 'g' || e.key === 'G') igniteGlitch(1);
});