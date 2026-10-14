// CENA: chão de grade
// Um plano com linhas horizontais em perspectiva. As linhas "andam" na direção
// de quem assiste, e a velocidade acompanha o grave.

const FLOOR_TOP = '#c5ace2';          // chão perto do horizonte (lavanda clara)
const FLOOR_BOTTOM = '#6f4fc0';       // chão perto de nós (violeta mais fundo)
const FLOOR_LINE_RGB = '255, 255, 255'; // cor das linhas da grade
const FLOOR_COLS = 8;       // quantas linhas verticais de cada lado do centro
const FLOOR_COL_GAP = 110;  // distância entre elas na base da tela, em pixels
const FLOOR_TOP_RGB = '255, 200, 235';     // rosa claro perto do horizonte
const FLOOR_BOTTOM_RGB = '170, 140, 255';  // lilás perto de nós
const FLOOR_ALPHA = [0.50, 0.90];  

let floorScroll = 0;      // deslocamento das linhas, de 0 a 1 (estado entre frames)
const FLOOR_LINES = 12;   // quantas linhas horizontais existem ao mesmo tempo

function drawFloor(dt, level) {
  const c = drawingContext;
  const h = H - HORIZON_Y;   // altura do chão na tela

  c.save();

  // Preenchimento: degradê do horizonte até a base da tela.
  const g = c.createLinearGradient(0, HORIZON_Y, 0, H);
    g.addColorStop(0, `rgba(${FLOOR_TOP_RGB}, ${FLOOR_ALPHA[0]})`);
    g.addColorStop(1, `rgba(${FLOOR_BOTTOM_RGB}, ${FLOOR_ALPHA[1]})`);
    c.fillStyle = g;
    c.fillRect(0, HORIZON_Y, W, h);

  // Avança o deslocamento. O % 1 faz voltar a 0 ao chegar em 1, em loop.
  floorScroll = (floorScroll + dt * (0.25 + level * 1.2)) % 1;

  // Linhas horizontais.
  for (let i = 0; i < FLOOR_LINES; i++) {
    const p = (i + floorScroll) / FLOOR_LINES;   // posição da linha: 0 = horizonte, 1 = base
    const y = HORIZON_Y + h * p * p;             // p ao quadrado cria a perspectiva

    c.lineWidth = 1 + p * 3;                                   // mais grossa perto de nós
    c.strokeStyle = `rgba(${FLOOR_LINE_RGB}, ${0.25 + p * 0.6})`; // mais forte perto de nós
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(W, y);
    c.stroke();
  }

  c.restore();

    // Linhas verticais: todas saem do ponto de fuga (centro do horizonte) e
  // terminam em posições espaçadas na base da tela.
  const vx = W / 2;   // ponto de fuga: x
  const vy = HORIZON_Y;  // ponto de fuga: y

  // Degradê no traço: invisível no horizonte e visível na base. Sem ele, as
  // linhas se amontoam num ponto brilhante no centro.
  const vg = c.createLinearGradient(0, HORIZON_Y, 0, H);
  vg.addColorStop(0, `rgba(${FLOOR_LINE_RGB}, 0)`);
  vg.addColorStop(1, `rgba(${FLOOR_LINE_RGB}, 0.7)`);
  c.strokeStyle = vg;
  c.lineWidth = 2;

  for (let k = -FLOOR_COLS; k <= FLOOR_COLS; k++) {
    c.beginPath();
    c.moveTo(vx, vy);
    c.lineTo(vx + k * FLOOR_COL_GAP, H);   // k = 0 é a linha reta do meio
    c.stroke();
  }
}
