// Nebulosa colorida em baixa resolução para manter a pintura leve por frame.
let sky;
const SKY_WIDTH = 72;
const SKY_HEIGHT = 128;
const SKY_UPDATE_INTERVAL = 1 / 15;
const skyImg = new ImageData(SKY_WIDTH, SKY_HEIGHT);
let skyLastPaintTime = -Infinity;

function paintSky(t) {
  if (t - skyLastPaintTime < SKY_UPDATE_INTERVAL) return;

  skyLastPaintTime = t;
  const pixels = skyImg.data;
  const columns = Array.from({ length: skyImg.width }, (_, x) => {
    const u = x / (skyImg.width - 1);
    return {
      u,
      waveOne: Math.sin(u * 8 + noise(u * 2, t * 0.025) * 2.4 + t * 0.035),
      waveTwo: Math.sin(u * 11 - noise(u * 3 + 7, t * 0.02) * 2 + t * 0.025 + 1.8),
      auroraBlend: constrain((Math.sin(u * 5 + t * 0.03) + 1) * 0.5, 0, 1),
    };
  });

  for (let y = 0; y < skyImg.height; y++) {
    const p = y / (skyImg.height - 1);
    const baseR = lerp(SKY_TOP[0], SKY_BOTTOM[0], p);
    const baseG = lerp(SKY_TOP[1], SKY_BOTTOM[1], p);
    const baseB = lerp(SKY_TOP[2], SKY_BOTTOM[2], p);
    const auroraFade = constrain((0.68 - p) * 5, 0, 1);
    for (let x = 0; x < skyImg.width; x++) {
      const column = columns[x];
      const u = column.u;
      const cloud = noise(
        x * 0.025 + t * 0.009,
        y * 0.019 + t * 0.004,
      );
      const detail = noise(
        x * 0.061 - t * 0.006,
        y * 0.047 + t * 0.003,
      );
      const density = constrain((cloud * 0.76 + detail * 0.24 - 0.36) * 2.1, 0, 1);
      const nebula = Math.pow(density, 1.35) * (0.72 + 0.28 * Math.sin(u * Math.PI));
      const colorBlend = constrain(u * 0.72 + cloud * 0.28, 0, 1);
      const nebulaR = lerp(103, 53, colorBlend);
      const nebulaG = lerp(47, 126, colorBlend);
      const nebulaB = lerp(174, 211, colorBlend);
      const ribbonOne = Math.exp(-Math.pow((p - (0.25 + column.waveOne * 0.09)) * 11, 2));
      const ribbonTwo = Math.exp(-Math.pow((p - (0.43 + column.waveTwo * 0.07)) * 14, 2));
      const aurora = Math.min(0.3, (ribbonOne * 0.2 + ribbonTwo * 0.16) * auroraFade);
      const auroraR = lerp(155, 218, column.auroraBlend);
      const auroraG = lerp(195, 175, column.auroraBlend);
      const auroraB = 255;
      const i = (y * skyImg.width + x) * 4;
      pixels[i] = lerp(lerp(baseR, nebulaR, nebula), auroraR, aurora);
      pixels[i + 1] = lerp(lerp(baseG, nebulaG, nebula), auroraG, aurora);
      pixels[i + 2] = lerp(lerp(baseB, nebulaB, nebula), auroraB, aurora);
      pixels[i + 3] = 255;
    }
  }
  sky.drawingContext.putImageData(skyImg, 0, 0);
}
