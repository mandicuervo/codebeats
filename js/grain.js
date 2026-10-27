const GRAIN = {
  scale: 0.1,
  opacity: 0.01,
};

let grainCanvas;
let grainContext;
let grainImageData;

function applyGrain() {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = Math.round(W * GRAIN.scale);
    grainCanvas.height = Math.round(H * GRAIN.scale);
    grainContext = grainCanvas.getContext('2d');
    grainImageData = grainContext.createImageData(grainCanvas.width, grainCanvas.height);
  }

  const pixels = grainImageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const value = Math.random() < 0.5 ? 0 : 255;
    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
    pixels[i + 3] = 255;
  }
  grainContext.putImageData(grainImageData, 0, 0);

  const c = drawingContext;
  c.save();
  c.globalAlpha = GRAIN.opacity;
  c.imageSmoothingEnabled = false;
  c.drawImage(grainCanvas, 0, 0, W, H);
  c.restore();
}
