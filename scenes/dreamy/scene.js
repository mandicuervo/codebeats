// CENA: dreamy
// Contrato com o motor: sceneSetup() roda uma vez e sceneDraw(f) roda a cada
// frame. `f` traz o tempo e a análise do som (veja js/sketch.js).

// Nível suavizado do grave. Alimenta o sol e a velocidade do chão, sem tremer.
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

  // Pulsos do médio: criam gotas e dão um clarão fraco na porta.
  if (f.midHit) {
    spawnDrops(f.mid, f.pitch);
    igniteDoor(0.5);
  }

  // Pulsos do agudo: intensificam o pulso da porta e podem ativar o glitch.
  if (f.trebleHit) {
    igniteDoor(1);
    if (Math.random() < GLITCH_CHANCE) igniteGlitch(1);
  }

  // Camadas, de trás para frente: o que vem depois fica por cima.
  drawSun(level);
  drawFloor(f.dt, level);
  drawDoor(level);
  drawSparkle(f.dt);
  applyGlitch();
}