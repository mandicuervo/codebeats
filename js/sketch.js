// MOTOR: orquestra o canvas e o som
// Cria o canvas, mede o som independentemente do desenho e entrega os números à cena.
// Não sabe nada de céu, gotas ou cores: isso é responsabilidade de cada cena.

let bassDebugEnabled = false;
let audioAnalysis = {
  bass: 0,
  mid: 0,
  treble: 0,
  bassHit: false,
  midHit: false,
  trebleHit: false,
  pitch: 0.5,
};
let lastAnalysisTime = 0;

function setup() {
  pixelDensity(1.5);     // canvas gravado em 1080x1920, mantendo a área lógica 720x1280
  createCanvas(W, H);
  sceneSetup();          // a cena prepara o que precisa (definida em scenes/)
  lastAnalysisTime = millis() / 1000;
  setInterval(updateAudioAnalysis, 1000 / 60);
}

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'b' && !event.repeat) {
    bassDebugEnabled = !bassDebugEnabled;
  }
});

function draw() {
  const t = millis() / 1000;
  const { bass, mid, treble, bassHit, midHit, trebleHit, pitch } = audioAnalysis;
  audioAnalysis.bassHit = false;
  audioAnalysis.midHit = false;
  audioAnalysis.trebleHit = false;

  // Entrega à cena tudo o que o motor sabe sobre este frame.
  sceneDraw({
    t,                                   // segundos desde o início
    dt: Math.min(deltaTime, 50) / 1000,  // duração do frame, limitada a 50 ms
    bass, mid, treble,                   // energia de cada faixa
    bassHit, midHit, trebleHit,          // pulsos
    bassThreshold: bassDet.threshold,
    bassCooldownRemaining: bassDet.cooldownRemaining,
    bassDebugEnabled,
    pitch,
  });
}

function updateAudioAnalysis() {
  const now = millis() / 1000;
  const dt = Math.min(now - lastAnalysisTime, 0.1);
  lastAnalysisTime = now;
  if (dt <= 0) return;

  readSpectrum();
  const bass = Math.pow(getBand(...BANDS.bass), 2.6);
  const mid = Math.pow(getBand(...BANDS.mid), 2.6);
  const treble = Math.pow(getBand(...BANDS.treble), 2.6);

  const bassHit = detect(bassDet, bass, now, dt);
  const midHit = detect(midDet, mid, now, dt);
  const trebleHit = detect(trebleDet, treble, now, dt);

  audioAnalysis.bass = bass;
  audioAnalysis.mid = mid;
  audioAnalysis.treble = treble;
  audioAnalysis.bassHit = audioAnalysis.bassHit || bassHit;
  audioAnalysis.midHit = audioAnalysis.midHit || midHit;
  audioAnalysis.trebleHit = audioAnalysis.trebleHit || trebleHit;
  if (midHit) audioAnalysis.pitch = pitch01(...PITCH_RANGE);
  if (!source) audioAnalysis.pitch = 0.5;
}