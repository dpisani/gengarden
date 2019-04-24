import { quat, vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';

/**
 * createDeviation - creates a vector slighly skewed from a given one
 */
const createDeviation = (
  originalDirection: vec3,
  minAngle: number,
  maxAngle: number,
  rng: prng,
): vec3 => {
  const chosenAngle = (maxAngle - minAngle) * rng() + minAngle;

  // create a vector deviating from the Y axis and then rotate it towards the original direction
  const deviated = vec3.fromValues(
    Math.sin(chosenAngle),
    Math.cos(chosenAngle),
    0,
  );

  const qRotateY = quat.create();
  quat.rotateY(qRotateY, qRotateY, Math.PI * 2 * rng());

  const qToOriginal = quat.rotationTo(
    quat.create(),
    vec3.fromValues(0, 1, 0),
    originalDirection,
  );

  vec3.transformQuat(deviated, deviated, qRotateY);
  vec3.transformQuat(deviated, deviated, qToOriginal);

  return deviated;
};

export default createDeviation;
