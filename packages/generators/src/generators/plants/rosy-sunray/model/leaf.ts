import { Node } from "gltf-builder";
import { generateSimpleLeafletBlueprint } from "../../../leaves/keypoint-leaflet/generators/simple-leaflet.ts";
import { generateLeafletModel } from "../../../leaves/keypoint-leaflet/model.ts";

export const generateLeafModel = ({ size }: { size: number }): Node => {
  // Expressed as a ratio of the total size
  const petioleLength = 0.01;
  const bladeMidpoint = 0.3;
  const bladeLength = 1 - petioleLength;

  const bp = generateSimpleLeafletBlueprint({
    stemLength: size * petioleLength,
    stemWidth: size * 0.01,
    leafletLength: size * bladeLength,
    leafletWidth: size * 0.1,
    leafletMidpointPosition: bladeMidpoint,
  });

  return generateLeafletModel(bp);
};
