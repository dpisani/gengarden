import { vec3 } from 'gl-matrix';
import { ParticleManipulator } from '../particle-system';

export interface BasicMotionParticle {
  position: vec3;
  velocity: vec3;
}

export const basicMotionManipulator: ParticleManipulator<
  BasicMotionParticle
> = ({ position, velocity }) => {
  return {
    position: vec3.add(vec3.create(), position, velocity),
  };
};
