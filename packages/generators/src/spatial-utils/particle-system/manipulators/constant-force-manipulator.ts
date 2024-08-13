import { ParticleManipulator } from "../particle-system";
import { vec3 } from "gl-matrix";

interface ConstantForceParticle {
  force: vec3;
}

export const makeConstantForceManipulator =
  (force: vec3): ParticleManipulator<ConstantForceParticle> =>
  ({ force: currentForce }) => ({
    force: vec3.add(vec3.create(), force, currentForce),
  });
