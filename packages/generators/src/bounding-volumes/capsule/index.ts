// Represents a sphere swept along a line segment

import { vec3 } from "gl-matrix";
import { BoundingVolume } from "../types.ts";

export default class BoundingBox implements BoundingVolume {
  private start: vec3;
  private end: vec3;
  private squareRadius: number;

  constructor(start: vec3, end: vec3, radius: number) {
    this.start = start;
    this.end = end;
    this.squareRadius = Math.pow(radius, 2);
  }

  public containsPoint(p: vec3): boolean {
    return this.squareDistance(p) <= this.squareRadius;
  }

  private squareDistance(p: vec3): number {
    const { start, end } = this;

    const n: vec3 = vec3.sub(vec3.create(), end, start);
    const pa: vec3 = vec3.sub(vec3.create(), start, p);

    const c: number = vec3.dot(n, pa);

    // Closest point is a
    if (c > 0.0) {
      return vec3.dot(pa, pa);
    }

    const bp: vec3 = vec3.sub(vec3.create(), p, end);

    // Closest point is b
    if (vec3.dot(n, bp) > 0.0) {
      return vec3.dot(bp, bp);
    }

    // Closest point is between a and b
    const e: vec3 = vec3.scale(
      vec3.create(),
      vec3.sub(vec3.create(), pa, n),
      c / vec3.dot(n, n),
    );

    return vec3.dot(e, e);
  }
}
