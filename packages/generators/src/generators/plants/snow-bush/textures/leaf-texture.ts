import { createCanvas } from "canvas";
import { getCanvasBuffer } from "../../../util/get-canvas-buffer";

export interface SnowBushLeafTextureGeneratorSpec {
  size: number;
}

export const generateSnowBushLeafTexture = ({
  size,
}: SnowBushLeafTextureGeneratorSpec): Promise<Buffer | ArrayBuffer> => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const bgGradient = ctx.createLinearGradient(0, 0, size, 0);
  bgGradient.addColorStop(0, "#3c7d4d");
  bgGradient.addColorStop(1, "#2e633c");

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  return getCanvasBuffer(canvas);
};
