// =========================
// CENA: dreamcore-sky
// =========================
// Contrato com o motor: sceneSetup() roda uma vez e sceneDraw(f) roda a cada
// frame. `f` traz o tempo e a análise do som (veja js/sketch.js).

// Nível suavizado do grave, para o círculo crescer e encolher sem tremer.
let level = 0;

function sceneSetup() {
  noiseDetail(3, 0.5);        // textura das nuvens (ruído de Perlin)
  sky = createGraphics(72, 128);
  sky.pixelDensity(1);
}

function sceneDraw(f) {
  // Fundo: céu pequeno esticado sobre o canvas inteiro.
  paintSky(f.t);
  image(sky, 0, 0, W, H);

  // Grave: aproxima 40% do caminho do valor atual a cada frame.
  level = lerp(level, f.bass, 0.4);

  // Pulsos: o médio cria gotas e o agudo acende as estrelas.
  if (f.midHit) spawnDrops(f.mid, f.pitch);
  if (f.trebleHit) igniteGlints();

  drawSun(level);
  drawSparkle(f.dt);
}