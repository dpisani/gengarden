import { KeypointStemAxisBlueprint } from '../../../stem-axis/keypoint-stem-axis';
import {
  BasicMotionParticle,
  basicMotionManipulator,
} from '../../../../spatial-utils/particle-system/manipulators/basic-motion-manipulator';
import { angleToVec } from '../../../../spatial-utils/angle-to-vec';
import { vec3 } from 'gl-matrix';
import { ParticleSystem } from '../../../../spatial-utils/particle-system/particle-system';
import { makeConstantForceManipulator } from '../../../../spatial-utils/particle-system/manipulators/constant-force-manipulator';
import { prng } from 'seedrandom';
import { getRandomInt } from '../../../util/math';

const createParticle = (position: vec3, rng: prng) => {
  const a = rng() * Math.PI * 2;

  const direction = angleToVec(a);
  const speed = rng() * 0.003 + 0.005;

  return {
    position,
    velocity: vec3.scale(direction, direction, speed),
    force: vec3.create(),
    mass: 0.7 + rng() * 0.2,
  };
};

export const generateStemAxes = (rng: prng): KeypointStemAxisBlueprint[] => {
  const numL1Particles = 6;
  const numL2Particles = getRandomInt(2, numL1Particles, rng);

  // Use a particle system to simulate stem growth
  const particlesL1: BasicMotionParticle[] = Array.from({
    length: numL1Particles,
  }).map(() => {
    return createParticle(vec3.fromValues(0, 0, 0), rng);
  });

  const system = new ParticleSystem<BasicMotionParticle>({
    manipulators: [
      makeConstantForceManipulator(vec3.fromValues(0, 0.003, 0)),
      basicMotionManipulator,
    ],
  });

  const trailsL1 = system.simulate(particlesL1, 8);

  // create offshoots from the first layer of stems
  const particlesL2 = trailsL1.slice(0, numL2Particles).map(trail => {
    const pSnapshot = trail[getRandomInt(3, 5, rng)][0];

    const p = createParticle(pSnapshot.position, rng);

    return {
      ...p,
      // interpolate the velocity from the main stem's velocity
      velocity: vec3.lerp(p.velocity, p.velocity, pSnapshot.velocity, 0.3),
    };
  });

  const trailsL2 = system.simulate(particlesL2, 6);

  return [...trailsL1, ...trailsL2].map(trail => {
    const keypoints = trail.map(([p]) => ({
      position: p.position,
      width: 0.002,
    }));

    return new KeypointStemAxisBlueprint(keypoints);
  });
};
