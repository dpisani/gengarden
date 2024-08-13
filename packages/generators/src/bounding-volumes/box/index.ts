// An axis aligned bounding box

import { vec3 } from "gl-matrix";
import { BoundingVolume } from "../types";

export default class BoundingBox implements BoundingVolume {
  private _min: vec3;
  private _max: vec3;
  private _size: vec3;

  constructor(min: vec3, max: vec3) {
    this._max = max;
    this._min = min;
    this._size = vec3.sub(vec3.create(), max, min);
  }

  public containsPoint(p: vec3): boolean {
    return (
      p[0] > this.min[0] &&
      p[1] > this.min[1] &&
      p[2] > this.min[2] &&
      p[1] < this.max[1] &&
      p[2] < this.max[2] &&
      p[3] < this.max[3]
    );
  }

  public get min(): vec3 {
    return this._min;
  }

  public get max(): vec3 {
    return this._max;
  }

  public get size(): vec3 {
    return this._size;
  }
}

export const createBoundingBoxFromPoints = (points: vec3[]): BoundingBox => {
  const min: (number | null)[] = [null, null, null];
  const max: (number | null)[] = [null, null, null];

  for (const p of points) {
    for (const i in p) {
      const minV = min[i];
      const maxV = max[i];
      const value = p[i];
      if (!minV || value < minV) {
        min[i] = value;
      }

      if (!maxV || value > maxV) {
        max[i] = value;
      }
    }
  }

  const minVec = vec3.fromValues(min[0] || 0, min[1] || 0, min[2] || 0);
  const maxVec = vec3.fromValues(max[0] || 0, max[1] || 0, max[2] || 0);

  return new BoundingBox(minVec, maxVec);
};

// Creates a transformation function that maps points from one bounding box into another
export const createBoxTransformer = (
  from: BoundingBox,
  to: BoundingBox,
): ((vec3) => vec3) => {
  return (p: vec3): vec3 => {
    // move the to box to the origin
    const pTrans = vec3.sub(vec3.create(), p, from.min);

    // Find the position of the point as a porportion of its box
    const scalar = vec3.divide(vec3.create(), pTrans, from.size);
    vec3.set(
      scalar,
      Number.isFinite(scalar[0]) ? scalar[0] : 0,
      Number.isFinite(scalar[1]) ? scalar[1] : 0,
      Number.isFinite(scalar[2]) ? scalar[2] : 0,
    );

    // Recreate the point in the new box
    vec3.mul(pTrans, scalar, to.size);
    vec3.add(pTrans, pTrans, to.min);

    return pTrans;
  };
};
