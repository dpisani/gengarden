import { Node } from 'gltf-builder';
import getRandomGenerator from '../../util/get-random-generator';
import { KeypointStemAxisBlueprint } from '../../stem-axis/keypoint-stem-axis';
import { prng } from 'seedrandom';
import { angleToVec } from '../../../spatial-utils/angle-to-vec';
import { vec3 } from 'gl-matrix';
import { ParticleSystem } from '../../../spatial-utils/particle-system/particle-system';
import { makeConstantForceManipulator } from '../../../spatial-utils/particle-system/manipulators/constant-force-manipulator';
import {
  basicMotionManipulator,
  BasicMotionParticle,
} from '../../../spatial-utils/particle-system/manipulators/basic-motion-manipulator';
import { generateTubePathFromStemAxis } from '../../tube-path/from-stem-axis';

interface RosySunraySpec {
  randomSeed?: string;
}

const generateStemAxes = (rng: prng): KeypointStemAxisBlueprint[] => {
  // Use a particle system to simulate stem growth
  const particles: BasicMotionParticle[] = Array.from({ length: 6 }).map(() => {
    const a = rng() * Math.PI * 2;

    const direction = angleToVec(a);
    // vec3.add(direction, direction, vec3.fromValues(0, rng() * 0.01, 0)); // make some stems taller
    const speed = rng() * 0.005 + 0.005;

    return {
      position: vec3.fromValues(0, 0, 0),
      velocity: vec3.scale(direction, direction, speed),
    };
  });

  const system = new ParticleSystem<BasicMotionParticle>({
    manipulators: [
      makeConstantForceManipulator(vec3.fromValues(0, 0.006, 0)),
      basicMotionManipulator,
    ],
  });

  const trails = system.simulate(particles, 10);

  return trails.map(trail => {
    const keypoints = trail.map(([p]) => ({
      position: p.position,
      width: 0.002,
    }));

    return new KeypointStemAxisBlueprint(keypoints);
  });
};

export const generateRosySunray = ({
  randomSeed: seed,
}: RosySunraySpec): Node => {
  const rng = getRandomGenerator(seed);

  // create stems
  const stemAxes = generateStemAxes(rng);

  const model = new Node();

  for (const axis of stemAxes) {
    model.addChild(generateTubePathFromStemAxis(axis));
  }

  return model;
};
