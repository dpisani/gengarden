import { ParticleManipulator } from '../particle-system';
import { vec3 } from 'gl-matrix';

interface ConstantForceParticle {
  velocity: vec3;
}

export const makeConstantForceManipulator = (
  force: vec3,
): ParticleManipulator<ConstantForceParticle> => ({ velocity }) => ({
  velocity: vec3.add(vec3.create(), velocity, force),
});
