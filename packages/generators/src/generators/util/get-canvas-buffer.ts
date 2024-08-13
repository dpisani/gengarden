import { Canvas } from "canvas";

export const getCanvasBuffer = (
  canvas: Canvas | HTMLCanvasElement,
): Promise<Buffer | ArrayBuffer> => {
  if (canvas instanceof HTMLCanvasElement) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) {
          resolve(value.arrayBuffer());
        } else {
          reject(new Error("Cannot create canvas blob"));
        }
      });
    });
  }

  return Promise.resolve(canvas.toBuffer());
};
