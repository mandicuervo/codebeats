const W = 720, H = 1280;

// =========================
// 1) CONTROLE DE ÁUDIO
// =========================
// Essas variáveis guardam o contexto de áudio e o buffer da música carregada.
// O AudioContext é o ponto central da reprodução do som no navegador.
let audioCtx = null;
let audioBuffer = null;

// Elemento do input de arquivo para escolher a música.
const fileInput = document.getElementById('audioFile');

// Quando o usuário seleciona um arquivo de áudio, ele é convertido em bytes
// e decodificado para um AudioBuffer, que pode ser reproduzido pelo navegador.
fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Cria o contexto de áudio somente na primeira vez para evitar múltiplas instâncias.
  audioCtx = audioCtx || new AudioContext();

  const bytes = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(bytes);

  // Habilita o botão de reprodução apenas quando a música estiver pronta.
  btnPlay.disabled = false;
});

// Representa a fonte de reprodução atual da música.
// Quando ela existe, quer dizer que a música está tocando.
let source = null;

// Botão que alterna entre tocar e parar a música.
const btnPlay = document.getElementById('btnPlay');

// Para a reprodução atual, limpa o evento de finalização e interrompe a source.
function stopMusic() {
  if (!source) return;

  source.onended = null;
  source.stop();
  source = null;
  btnPlay.textContent = 'Tocar';
}

// Inicia a reprodução do buffer carregado.
// Também garante que o analisador de frequência esteja ativo para medir o som.
function startMusic() {
  audioCtx.resume();
  ensureAnalyser();

  source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(analyser);
  source.onended = stopMusic;
  source.start();

  btnPlay.textContent = 'Parar';
}

// Quando o usuário clica no botão, ele alterna entre tocar e parar.
btnPlay.addEventListener('click', () => (source ? stopMusic() : startMusic()));

// =========================
// 2) ANÁLISE DO BAIXO (BASS)
// =========================
// O objetivo aqui é medir a intensidade do grave da música e usar esse valor
// para controlar o tamanho do círculo na tela. Essa análise usa o FFT (Fast Fourier Transform),
// que separa o som em frequências diferentes.
let analyser = null;
let freqData = null;

// Cria o analisador de áudio somente uma vez e conecta ele à saída do sistema.
function ensureAnalyser() {
  if (analyser) return;

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.connect(audioCtx.destination);

  // Array com os valores das frequências disponíveis para leitura.
  freqData = new Uint8Array(analyser.frequencyBinCount);
}

// =========================
// 3) PARTE VISUAL DO CANVAS
// =========================
// A variável level funciona como um valor suavizado da intensidade do som,
// permitindo que o círculo cresça e diminua de forma mais natural e menos brusca.
let level = 0;
let sky;
const SKY_TOP = [160, 190, 255];
const SKY_BOTTOM = [255, 212, 236];
const drops = [];
skyImg = new ImageData(72, 128);

const glints = Array.from({ length: 28 }, () => ({
  flash: 0,
  x: Math.random() * W,
  y: Math.random() * H * 0.6,
  r: 14 + Math.random() * 26,
  speed: 0.6 + Math.random() * 1.4,
  phase: Math.random() * Math.PI * 2,
}));

const BANDS = {
  bass:   [40, 250],
  mid:    [250, 2500],
  treble: [2500, 10000],
};

const PITCH_RANGE = [300, 1200];
const PITCH_SPREAD = 0.6;
const STAR_RGB = '255, 226, 150';
const DROP_RGB = '255, 140, 210';

function setup() {
  pixelDensity(1);
  createCanvas(W, H);
  noiseDetail(3, 0.5);
  sky = createGraphics(72, 128);
  sky.pixelDensity(1);
}

function makeDetector(ratio, floor, cooldown) {
  return { avg: 0.01, last: 0, ratio, floor, cooldown };
}

function detect(d, value, now) {
  const hit = value > d.avg * d.ratio + d.floor && now - d.last > d.cooldown;
  d.avg = lerp(d.avg, value, 0.08);
  if (hit) d.last = now;
  return hit;
}

const midDet = makeDetector(1.8, 0.004, 0.07);
const trebleDet = makeDetector(1.8, 0.004, 0.07);

function spawnDrops(strength) {
  const px = peakX(...PITCH_RANGE);
  const n = 2 + Math.floor(Math.min(1, strength * 6) * 5);
  for (let i = 0; i < n; i++) drops.push(makeDrop(px));
  if (drops.length > 150) drops.splice(0, drops.length - 150);
}

function igniteGlints() {
  for (const g of glints) if (Math.random() < 0.35) g.flash = 1;
}

function draw() {
  const t = millis() / 1000;
  paintSky(t);
  image(sky, 0, 0, W, H);

  readSpectrum();
  const bass = Math.pow(getBand(...BANDS.bass), 2.6);
  const mid = Math.pow(getBand(...BANDS.mid), 2.6);
  const treble = Math.pow(getBand(...BANDS.treble), 2.6);

  level = lerp(level, bass, 0.4);

  if (detect(midDet, mid, t)) spawnDrops(mid);
  if (detect(trebleDet, treble, t)) igniteGlints();

  drawSparkle(Math.min(deltaTime, 50) / 1000);
  circle(width / 2, height / 2, 80 + level * 300);
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

function paintSky(t) {
  const px = skyImg.data;
  for (let y = 0; y < skyImg.height; y++) {
    const k = y / (skyImg.height - 1);
    const r0 = lerp(SKY_TOP[0], SKY_BOTTOM[0], k);
    const g0 = lerp(SKY_TOP[1], SKY_BOTTOM[1], k);
    const b0 = lerp(SKY_TOP[2], SKY_BOTTOM[2], k);
    for (let x = 0; x < skyImg.width; x++) {
      const n = noise(x * 0.045, y * 0.03, t * 0.12);
      const cloud = constrain((n - 0.42) * 2.4, 0, 1);
      const i = (y * skyImg.width + x) * 4;
      px[i]     = lerp(r0, 255, cloud);
      px[i + 1] = lerp(g0, 255, cloud);
      px[i + 2] = lerp(b0, 255, cloud);
      px[i + 3] = 255;
    }
  }
  sky.drawingContext.putImageData(skyImg, 0, 0);
}

// Retorna um valor entre 0 e 1 representando a energia do grave da música.
// Esse valor é calculado a partir da faixa de frequências aproximada do baixo.
function readSpectrum() {
  if (analyser && source) analyser.getByteFrequencyData(freqData);
}

function getBand(lowHz, highHz) {
  if (!analyser || !source) return 0;
  const binHz = audioCtx.sampleRate / analyser.fftSize;
  const from = Math.max(1, Math.floor(lowHz / binHz));
  const to = Math.min(freqData.length - 1, Math.ceil(highHz / binHz));
  let sum = 0;
  for (let i = from; i <= to; i++) sum += freqData[i];
  return sum / ((to - from + 1) * 255);
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

function peakX(lowHz, highHz) {
  const binHz = audioCtx.sampleRate / analyser.fftSize;
  const from = Math.max(1, Math.floor(lowHz / binHz));
  const to = Math.min(freqData.length - 1, Math.ceil(highHz / binHz));
  let best = from;
  for (let i = from + 1; i <= to; i++) {
    if (freqData[i] > freqData[best]) best = i;
  }

  if (freqData[best] < 30) return W / 2;
  const k = Math.log((best * binHz) / lowHz) / Math.log(highHz / lowHz);
  return map(constrain(k, 0, 1), 0, 1, W * (0.5 - PITCH_SPREAD / 2), W * (0.5 + PITCH_SPREAD / 2));
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