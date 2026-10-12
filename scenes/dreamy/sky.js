// =========================
// CENA dreamy: CÉU
// =========================
// O céu é calculado pixel a pixel, mas em tamanho pequeno (72x128) e depois
// esticado sobre o canvas inteiro. Calcular 720x1280 pixels por frame seria
// pesado demais para a CPU, e o esticamento já suaviza as nuvens.

// Canvas pequeno fora da tela, criado em sceneSetup().
let sky;

// Buffer de pixels (R, G, B, A por pixel). Escrevemos nele e copiamos para o
// canvas, sem ler o canvas de volta, porque a leitura é lenta.
const skyImg = new ImageData(72, 128);

// Pinta um frame do céu. t = tempo em segundos, que faz as nuvens se moverem.
function paintSky(t) {
  const px = skyImg.data;

  for (let y = 0; y < skyImg.height; y++) {
    // k vai de 0 (topo) a 1 (base) e escolhe a cor do degradê nesta linha.
    const k = y / (skyImg.height - 1);
    const r0 = lerp(SKY_TOP[0], SKY_BOTTOM[0], k);
    const g0 = lerp(SKY_TOP[1], SKY_BOTTOM[1], k);
    const b0 = lerp(SKY_TOP[2], SKY_BOTTOM[2], k);

    for (let x = 0; x < skyImg.width; x++) {
      // Ruído de Perlin: números aleatórios que variam suavemente entre pixels
      // vizinhos. O 3º parâmetro (tempo) faz o padrão evoluir devagar.
      const n = noise(x * 0.045, y * 0.03, t * 0.12);

      // Densidade da nuvem, de 0 (céu limpo) a 1 (branco). Abaixo de 0.42 não
      // há nuvem; o 2.4 controla o quão rápido ela fica densa.
      const cloud = constrain((n - 0.42) * 2.4, 0, 1);

      // Cada pixel ocupa 4 posições seguidas no array: R, G, B, A.
      const i = (y * skyImg.width + x) * 4;
      px[i]     = lerp(r0, 255, cloud); // mistura a cor do céu com branco
      px[i + 1] = lerp(g0, 255, cloud);
      px[i + 2] = lerp(b0, 255, cloud);
      px[i + 3] = 255;                  // totalmente opaco
    }
  }

  // Copia o buffer para o canvas pequeno de uma vez.
  sky.drawingContext.putImageData(skyImg, 0, 0);
}