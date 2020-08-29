import { createCanvas } from 'canvas';

export interface SnowBushLeafTextureGeneratorSpec {
  size: number;
}

export const generateSnowBushStemTexture = ({
  size,
}: SnowBushLeafTextureGeneratorSpec): Buffer => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const bgGradient = ctx.createLinearGradient(0, size, 0, 0);
  bgGradient.addColorStop(0, '#cf2969');
  bgGradient.addColorStop(1, '#543423');

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  return canvas.toBuffer();
};
