import { vec3 } from 'gl-matrix';
import { ParticleManipulator } from '../particle-system';

export interface BasicMotionParticle {
  position: vec3;
  mass: number;
  force: vec3;
  velocity: vec3;
}

// Basic Newtonian motion calculator
export const basicMotionManipulator: ParticleManipulator<
  BasicMotionParticle
> = ({ position, velocity, force, mass }) => {
  const acceleration = vec3.scale(vec3.create(), force, 1 / mass);
  const v = vec3.add(vec3.create(), velocity, acceleration);
  const p = vec3.add(vec3.create(), position, v);

  return {
    position: p,
    velocity: v,
  };
};
