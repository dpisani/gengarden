import { Node } from 'gltf-builder';
import { KeypointStemAxisBlueprint } from '../../../stem-axis/keypoint-stem-axis';
import { generateSpiralArrangementBlueprint } from '../../../stem-arrangement/spiral-arrangement/spiral-arrangement';
import { sampleInterval } from '../../../util/math';
import { generateTubePathFromStemAxis } from '../../../tube-path/from-stem-axis';
import { generateLeafModel } from './leaf';
import { mat4 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import { UP_VECTOR } from '../../../../spatial-utils/vector-util';
import { quat } from 'gl-matrix';
import { prng } from 'seedrandom';

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

  model.addChild(generateTubePathFromStemAxis(axis));

  return model;
};
