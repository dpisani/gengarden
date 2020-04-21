// An axis aligned bounding box

import { vec3 } from 'gl-matrix';
import { BoundingVolume } from '../types';

export default class BoundingBox implements BoundingVolume {
  private min: vec3;
  private max: vec3;

  constructor(min: vec3, max: vec3) {
    this.max = max;
    this.min = min;
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
}
