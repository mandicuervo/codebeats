// MOTOR: orquestra o canvas e o som
// Cria o canvas e, a cada frame, mede o som e entrega os números à cena.
// Não sabe nada de céu, gotas ou cores: isso é responsabilidade de cada cena.

let bassDebugEnabled = false;

function setup() {
  pixelDensity(1.5);     // canvas gravado em 1080x1920, mantendo a área lógica 720x1280
  createCanvas(W, H);
  sceneSetup();          // a cena prepara o que precisa (definida em scenes/)
}

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'b' && !event.repeat) {
    bassDebugEnabled = !bassDebugEnabled;
  }
});

function draw() {
  const t = millis() / 1000;

  // Espectro atual, medido uma única vez por frame.
  readSpectrum();

  // Energia de cada faixa, de 0 a 1. O expoente 2.6 acentua os picos e achata
  // o nível médio: sem ele, em música alta o valor ficaria sempre alto.
  const bass = Math.pow(getBand(...BANDS.bass), 2.6);
  const mid = Math.pow(getBand(...BANDS.mid), 2.6);
  const treble = Math.pow(getBand(...BANDS.treble), 2.6);

  // Pulsos: true apenas no instante em que a energia sobe bruscamente.
  const bassHit = detect(bassDet, bass, t);
  const midHit = detect(midDet, mid, t);
  const trebleHit = detect(trebleDet, treble, t);


  // Entrega à cena tudo o que o motor sabe sobre este frame.
  sceneDraw({
    t,                                   // segundos desde o início
    dt: Math.min(deltaTime, 50) / 1000,  // duração do frame, limitada a 50 ms
    bass, mid, treble,                   // energia de cada faixa
    bassHit, midHit, trebleHit,          // pulsos
    bassThreshold: bassDet.threshold,
    bassCooldownRemaining: bassDet.cooldownRemaining,
    bassDebugEnabled,
    pitch: midHit ? pitch01(...PITCH_RANGE) : 0.5, // altura da nota, de 0 a 1
  });
}