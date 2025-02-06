import { mat4, quat, vec3 } from "gl-matrix";
import { Node } from "gltf-builder";
import { prng } from "seedrandom";
import { UP_VECTOR } from "../../../../spatial-utils/vector-util.ts";
import { generateMesh } from "../../../mesh/index.ts";
import { generateSpiralArrangementBlueprint } from "../../../stem-arrangement/spiral-arrangement/spiral-arrangement.ts";
import { KeypointStemAxisBlueprint } from "../../../stem-axis/keypoint-stem-axis/index.ts";
import { generateTubePathFromStemAxis } from "../../../tube-path/from-stem-axis.ts";
import { sampleInterval } from "../../../util/math.ts";
import { generateFlowerModel } from "./flower.ts";
import { generateLeafModel } from "./leaf.ts";

const LEAF_DENSITY = 60;

export const generateStemModel = ({
  axis,
  rng,
}: {
  axis: KeypointStemAxisBlueprint;
  rng: prng;
}): Node => {
  const model = new Node();

  const leafArrangement = generateSpiralArrangementBlueprint({
    axis,
    nodePositions: sampleInterval(
      0.1,
      0.8,
      Math.floor(axis.length * LEAF_DENSITY),
    ),
    spiralLevel: 2,
    forwardDivergenceLookup: () => Math.PI * 0.1,
    spiralOffset: Math.PI * 2 * rng(),
  });

  for (const leafNode of leafArrangement.nodes) {
    const leafModel = generateLeafModel({ size: 0.025 });

    const targetToMat = mat4.targetTo(
      mat4.create(),
      vec3.create(),
      leafNode.direction,
      UP_VECTOR,
    );

    const leafRotation = mat4.getRotation(quat.create(), targetToMat);

    leafModel
      .translation(
        leafNode.position[0],
        leafNode.position[1],
        leafNode.position[2],
      )
      .rotation(
        leafRotation[0],
        leafRotation[1],
        leafRotation[2],
        leafRotation[3],
      );

    model.addChild(leafModel);
  }

  // add flower at the end
  const terminalNode = axis.getAxisInfoAt(1);

  const flowerRotation = mat4.targetTo(
    mat4.create(),
    vec3.create(),
    terminalNode.axisDirection,
    UP_VECTOR,
  );

  const flowerTranslation = mat4.fromTranslation(
    mat4.create(),
    terminalNode.position,
  );
  const flowerMatrix = mat4.mul(
    mat4.create(),
    flowerTranslation,
    flowerRotation,
  );

  const flowerModel = generateFlowerModel({
    size: terminalNode.width * 20,
    petals: 35,
    spiralLevel: 8,
    rng,
  }).matrix(flowerMatrix);

  model
    .mesh(generateMesh(generateTubePathFromStemAxis(axis)))
    .addChild(flowerModel);

  return model;
};
