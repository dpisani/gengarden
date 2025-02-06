import Bezier from "bezier-js";
import { mat4, vec3 } from "gl-matrix";
import { Node } from "gltf-builder";
import { prng } from "seedrandom";
import { generateLeafBladeBoundaryFromCurve } from "../../../leaves/keypoint-leaflet/generators/bezier-blade.ts";
import { generateLeafBladeModel } from "../../../leaves/keypoint-leaflet/model.ts";
import { generateMesh, PrimitiveBlueprint } from "../../../mesh/index.ts";
import { generateSpiralArrangementBlueprint } from "../../../stem-arrangement/spiral-arrangement/spiral-arrangement.ts";
import { KeypointStemAxisBlueprint } from "../../../stem-axis/keypoint-stem-axis/index.ts";
import { generateTubePathFromStemAxis } from "../../../tube-path/from-stem-axis.ts";
import { NormalisedCurve } from "../../../util/curves.ts";
import { lerp, sampleInterval } from "../../../util/math.ts";

const rayFlowerCurve = new NormalisedCurve(
  new Bezier(
    { x: 0, y: 0 },
    { x: 0, y: 0.7 },
    { x: 1.5, y: 0.4 },
    { x: 2, y: 0 },
  ),
);

const NEGATIVE_Z_VECTOR = vec3.fromValues(0, 0, -1);

/**
 * Generates a Rosy Sunray flower.
 * Flower points along the -Z axis, so it can be redirected with a targetTo.
 */
export const generateFlowerModel = ({
  size,
  rng,
  petals,
  spiralLevel,
}: {
  size: number;
  rng: prng;
  petals: number;
  spiralLevel: number;
}): Node => {
  const model = new Node();

  const discPortion = 0.3;
  const rayPortion = 1 - discPortion;

  const primitives: PrimitiveBlueprint[] = [];

  // Make the head of the flower out of a tube
  const flowerHeadAxis = new KeypointStemAxisBlueprint([
    {
      position: vec3.fromValues(0, 0, 0),
      width: size * discPortion * 0.3,
    },
    {
      position: vec3.fromValues(0, 0, size * -0.1),
      width: size * discPortion,
    },
  ]);

  const tubePathMeshBp = generateTubePathFromStemAxis(flowerHeadAxis, {
    generateEndCap: true,
    numSides: 6,
  });

  primitives.push(...tubePathMeshBp.primitives);

  // Arrange the ray flowers around the outside
  const rayFlowerArrangement = generateSpiralArrangementBlueprint({
    axis: flowerHeadAxis,
    nodePositions: sampleInterval(0.6, 0.99, petals),
    spiralLevel: spiralLevel,
    forwardDivergenceLookup: (t) => lerp(Math.PI * 0.75, Math.PI * 0.51, t),
    spiralOffset: Math.PI * 2 * rng(),
  });

  // create petal shapes for each ray flower
  for (const rayFlowerNode of rayFlowerArrangement.nodes) {
    const bladeBoundary = generateLeafBladeBoundaryFromCurve({
      length: rayPortion * size,
      width: rayPortion * size * 0.095,
      curve: rayFlowerCurve,
    });

    const rotate = mat4.targetTo(
      mat4.create(),
      vec3.create(),
      rayFlowerNode.direction,
      NEGATIVE_Z_VECTOR,
    );

    const translate = mat4.fromTranslation(
      mat4.create(),
      rayFlowerNode.position,
    );

    const transform = mat4.mul(mat4.create(), translate, rotate);

    const bladeModel = generateLeafBladeModel({
      bladeBoundaries: [bladeBoundary],
    });

    // transform
    bladeModel.matrix(transform);

    model.addChild(bladeModel);
  }

  model.mesh(generateMesh({ primitives }));

  return model;
};
