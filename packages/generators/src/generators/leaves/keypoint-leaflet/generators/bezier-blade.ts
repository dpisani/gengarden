import { vec3 } from "gl-matrix";
import { PrimitiveVertex } from "../../../mesh/index.ts";
import { applyTexcoordsToBoundary } from "../../../util/apply-texcoords-to-boundary.ts";
import { NormalisedCurve } from "../../../util/curves.ts";
import { sampleInterval } from "../../../util/math.ts";

export type BezierLeafBladeSpec = {
  length: number;
  width: number;
  curve: NormalisedCurve;
};

/**
 * Generates a model for a symmetrical leaf blade shape. The shape is made using a given curve
 * which is stretched accroding to the input.
 * Model is oriented along the -Z axis.
 */
export const generateLeafBladeBoundaryFromCurve = ({
  length,
  width,
  curve,
}: BezierLeafBladeSpec): PrimitiveVertex[] => {
  const topBoundary = sampleInterval(0, 1, 6)
    .map((t) => curve.get(t))
    .map((v) => {
      const position = vec3.fromValues(v[1] * width, 0, -(v[0] * length));
      return { position };
    });

  // invert along the x axis to get the other half of the blade
  const bottomBoundary = topBoundary
    .map(({ position: [x, y, z], ...v }) => ({
      position: vec3.fromValues(-x, y, z),
      ...v,
    }))
    .reverse();

  const leafBoundary = [...topBoundary, ...bottomBoundary];
  applyTexcoordsToBoundary(leafBoundary);

  return leafBoundary;
};
