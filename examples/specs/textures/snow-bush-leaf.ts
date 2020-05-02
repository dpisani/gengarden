import * as fs from 'fs-extra';
import * as path from 'path';
import { loadImage, createCanvas } from 'canvas';

import { snowBushGeneratorComponents } from '@gengarden/generators';

const outputPath = path.resolve('textures/snow-bush-leaf.png');

const minPow = 5;
const maxPow = 8;

const getXForPow = (pow: number) => {
  const powWidth = Math.pow(2, pow) - 1;
  const minPowWidth = Math.pow(2, minPow) - 1;

  return powWidth - minPowWidth;
};

const compositeCanvas = createCanvas(
  getXForPow(maxPow + 1),
  Math.pow(2, maxPow),
);
const ctx = compositeCanvas.getContext('2d');

(async () => {
  for (let pow = minPow; pow <= maxPow; pow += 1) {
    const size = Math.pow(2, pow);
    const imageData = snowBushGeneratorComponents.generateSnowBushLeafTexture({
      size,
    });
    const img = await loadImage(imageData);
    ctx.drawImage(img, getXForPow(pow), compositeCanvas.height - size);
  }

  fs.outputFile(outputPath, compositeCanvas.toBuffer()).catch(e =>
    console.error(e),
  );
})();
