import { Canvas, createCanvas } from "canvas";
import { getCanvasBuffer } from "../../../util/get-canvas-buffer";

export interface SnowBushLeafTextureGeneratorSpec {
  size: number;
}

export const generateSnowBushStemTexture = ({
  size,
}: SnowBushLeafTextureGeneratorSpec): Promise<Buffer | ArrayBuffer> => {
  const canvas: Canvas | HTMLCanvasElement = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const bgGradient = ctx.createLinearGradient(0, size, 0, 0);
  bgGradient.addColorStop(0, "#cf2969");
  bgGradient.addColorStop(1, "#543423");

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  return getCanvasBuffer(canvas);
};
