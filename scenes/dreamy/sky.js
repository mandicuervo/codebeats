let sky;
skyImg = new ImageData(72, 128);

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