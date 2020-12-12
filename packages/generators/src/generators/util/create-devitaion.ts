import { quat, vec3 } from 'gl-matrix';

/**
 * createDeviation - creates a vector skewed from a given one
 */
export const createDeviation = (
  basis: vec3,
  // Angle away from the basis
  deviationAngle: number,
  // Angle around the basis
  rotationAngle: number,
  localUpDir?: vec3,
): vec3 => {
  // create a vector deviating from the Y axis and then rotate it towards the original direction
  const deviated = vec3.fromValues(
    Math.sin(deviationAngle),
    Math.cos(deviationAngle),
    0,
  );

  const qRotateY = quat.create();
  quat.rotateY(qRotateY, qRotateY, rotationAngle);

  const qToOriginal = quat.rotationTo(
    quat.create(),
    localUpDir ?? vec3.fromValues(0, 1, 0),
    basis,
  );

  vec3.transformQuat(deviated, deviated, qRotateY);
  vec3.transformQuat(deviated, deviated, qToOriginal);

  return deviated;
};