// DETECÇÃO DE PULSOS
// Transforma a energia contínua de uma faixa em eventos:
// "aconteceu um pulso agora". É isso que faz uma gota nascer a cada nota e uma
// estrela acender a cada ataque agudo.

// Cria um detector. Cada faixa tem o seu, com estado próprio:
//   avg       média móvel da energia, o "nível normal" dos últimos instantes
//   last      instante do último pulso, em segundos
//   ratio     quantas vezes acima da média conta como pulso
//   floor     folga fixa somada ao limite, para ignorar ruído quando tudo é ~0
//   cooldown  tempo mínimo entre dois pulsos, em segundos
function makeDetector(ratio, floor, cooldown) {
  return { avg: 0.01, last: 0, ratio, floor, cooldown };
}

// A média móvel usa o intervalo real para se adaptar igualmente em qualquer taxa.
function detect(d, value, now, dt) {
  // Registra o limite e o bloqueio para diagnóstico e usa os mesmos valores no pulso.
  d.threshold = d.avg * d.ratio + d.floor;
  d.cooldownRemaining = Math.max(0, d.cooldown - (now - d.last));
  const hit = value > d.threshold && d.cooldownRemaining === 0;

  // Mantém a resposta equivalente a 8% por frame a 60 Hz.
  const smoothing = 1 - Math.pow(1 - 0.08, dt * 60);
  d.avg = lerp(d.avg, value, smoothing);

  if (hit) d.last = now;
  return hit;
}

// Parâmetros: (ratio, floor, cooldown). Para ficar mais sensível, baixe o ratio.
const bassDet = makeDetector(1.5, 0.006, 0.008);
const midDet = makeDetector(1.4, 0.004, 0.07);
const trebleDet = makeDetector(1.55, 0.004, 0.1);