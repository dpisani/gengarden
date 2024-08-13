import Bezier from "bezier-js";
import { vec2 } from "gl-matrix";

/**
 * A bezier curve scaled to fit in a 1x1 length box at the origin
 *
 * @export
 * @class NormalisedCurve
 */
export class NormalisedCurve {
  private curve: Bezier;
  private bbox: ReturnType<Bezier["bbox"]>;
  private scalar: vec2;

  constructor(curve: Bezier) {
    this.curve = curve;

    this.bbox = curve.bbox();

    if (this.bbox.z) {
      throw new Error("Only 2D curves are supported");
    }

    const xScalar = 1 / (this.bbox.x.size || 1);
    const yScalar = 1 / (this.bbox.y.size || 1);

    this.scalar = vec2.fromValues(xScalar, yScalar);
  }

  public get(t: number): vec2 {
    const p = this.curve.get(t);

    return vec2.multiply(vec2.create(), vec2.fromValues(p.x, p.y), this.scalar);
  }

  /**
   * Computes the value of the curve at a given position
   *
   * @param {number} x position to test. Must be in the range [0,1]
   * @returns {number} the y value at the given position
   * @memberof NormalisedCurve
   */
  public valueAt(x: number): number {
    const xs = x / this.scalar[0];
    const t = this.curve.lineIntersects({
      p1: { x: xs, y: 0 },
      p2: { x: xs, y: 1 },
    });

    if (t.length !== 1) {
      // if at the end of the curve, get
      throw new Error(
        `Expected a single value at x=${x}. Got ${t.length} instead.`,
      );
    }

    const p = this.get(t[0]);

    const scaled = vec2.mul(p, p, this.scalar);

    return scaled[1];
  }
}
