// CENA: porta de luz
// Uma porta com topo arredondado, brilhando, em pé sobre o chão.
// O tamanho e o halo crescem nos pulsos do som.

// Posição e tamanho num só lugar, para ajustar fácil.
const DOOR = {
  x: W / 2,               // centro horizontal do canvas
  baseY: HORIZON_Y - 1,   // base da porta, quase em cima do horizonte
  w: 160,                 // largura
  h: 280,                 // altura
};

// Intensidade do clarão: 0 = apagada, 1 = pulso máximo.
// Decai sozinha a cada frame, igual ao flash das estrelas.
let doorFlash = 0;

// Chamada quando acontece um pulso. strength vai de 0 a 1: pulso forte acende
// no máximo, pulso fraco acende menos. Math.max garante que um pulso fraco
// nunca reduza um clarão que já esteja mais forte.
function igniteDoor(strength = 1) {
  doorFlash = Math.max(doorFlash, strength);
}

// Calcula as medidas da porta neste frame. No clarão ela cresce até 12%,
// a partir da base, e volta ao tamanho normal conforme o clarão se apaga.
function doorGeometry() {
  const grow = 1 + doorFlash * 0.12;
  const w = DOOR.w * grow;
  const h = DOOR.h * grow;
  const { x, baseY } = DOOR;
  return {
    x,
    baseY,
    w,
    h,
    topY: baseY - h,         // topo da porta
    cy: baseY - h / 2,       // centro vertical
  };
}

// Luz em volta da porta: um halo permanente suave e um clarão claro nos pulsos.
// lit = brilho base, de 0.6 (parado) até 1.0 (clarão máximo).
function drawDoorHalo(geo, lit) {
  const c = drawingContext;
  const { x, cy, h } = geo;

  const haloR = h * 1.6;
  const halo = c.createRadialGradient(x, cy, h * 0.2, x, cy, haloR);
  halo.addColorStop(0, `rgba(${DOOR_RGB}, ${0.3 * lit})`);
  halo.addColorStop(1, `rgba(${DOOR_RGB}, 0)`);
  c.fillStyle = halo;
  c.fillRect(x - haloR, cy - haloR, haloR * 2, haloR * 2);

  if (doorFlash > 0.03) {
    glow(x, cy, h * (1.1 + doorFlash * 0.7), doorFlash * 0.9, DOOR_RGB);
    glow(x, cy, h * 0.7, doorFlash * 0.8);                                 // núcleo branco
  }
}

// Corpo da porta: lado esquerdo sobe, um arco faz o topo, lado direito desce.
// Preenchimento em degradê: branco frio no topo, branco quente embaixo.
function drawDoorBody(geo) {
  const c = drawingContext;
  const { x, baseY, topY, w } = geo;

  c.beginPath();
  c.moveTo(x - w / 2, baseY);
  c.lineTo(x - w / 2, topY + w / 2);
  c.arc(x, topY + w / 2, w / 2, Math.PI, 0);   // meia-circunferência por cima
  c.lineTo(x + w / 2, baseY);
  c.closePath();

  const body = c.createLinearGradient(0, topY, 0, baseY);
  body.addColorStop(0, '#f3f5f6');
  body.addColorStop(1, `rgba(${DOOR_RGB}, 1)`);
  c.fillStyle = body;
  c.fill();
}

// Ponto de entrada, chamado pela cena a cada frame. Só orquestra:
// atualiza o clarão, mede a porta e desenha de trás para frente.
function drawDoor() {
  doorFlash *= 0.93;                  // perde 7% por frame: dura cerca de meio segundo

  const geo = doorGeometry();         // medidas da porta neste frame
  const lit = 0.6 + doorFlash * 0.4;

  const c = drawingContext;
  c.save();                           // isola o fillStyle para não vazar para outras camadas
  drawDoorHalo(geo, lit);             // luz atrás
  drawDoorBody(geo);                  // porta na frente
  c.restore();
}