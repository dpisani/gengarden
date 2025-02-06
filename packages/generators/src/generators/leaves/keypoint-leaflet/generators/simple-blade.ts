import Bezier from "bezier-js";
import { vec3 } from "gl-matrix";
import { PrimitiveVertex } from "../../../mesh/index.ts";
import { applyTexcoordsToBoundary } from "../../../util/apply-texcoords-to-boundary.ts";
import { NormalisedCurve } from "../../../util/curves.ts";
import { sampleInterval } from "../../../util/math.ts";

export type SimpleLeafBladeSpec = {
  length: number;
  width: number;
  /* Position of the widest part of the leaflet, expressed in the range [0,1] */
  midpoint: number;
};

const checkInvariants = (
  spec: SimpleLeafBladeSpec,
): { isValid: boolean; messages: string[] } => {
  let isValid = true;
  const messages: string[] = [];

  if (spec.midpoint < 0 || spec.midpoint > 1) {
    isValid = false;
    messages.push(
      `Expected midpoint to be in the range [0,1]. Instead got ${
        spec.midpoint
      }`,
    );
  }

  return { messages, isValid };
};

/**
 * Generates a model for a basic leaf blade shape. The shape is made using a predefined curve
 * which is stretched accroding to the input.
 * Model is oriented along the -Z axis.
 */
export const generateSimpleLeafBladeBoundary = ({
  length,
  width,
  midpoint,
}: SimpleLeafBladeSpec): PrimitiveVertex[] => {
  const check = checkInvariants({ midpoint, length, width });
  if (!check.isValid) {
    throw new Error(check.messages.join("\n"));
  }

  const baseLength = length * midpoint;
  const tipLength = length * (1 - midpoint);

  const baseTopBoundary = getPointsForSegment({
    segmentCurve: roundedBaseCurve,
    noSamples: 3,
    xOffset: 0,
    length: baseLength,
    width: width,
  });

  const tipTopBoundary = getPointsForSegment({
    segmentCurve: roundedTipCurve,
    noSamples: 4,
    xOffset: baseLength,
    length: tipLength,
    width: width,
  });

  const leafTopBoundary = [...baseTopBoundary, ...tipTopBoundary];

  const baseBottomBoundary = getPointsForSegment({
    segmentCurve: roundedBaseCurve,
    noSamples: 3,
    xOffset: 0,
    length: baseLength,
    width: width,
  });

  const tipBottomBoundary = getPointsForSegment({
    segmentCurve: roundedTipCurve,
    noSamples: 4,
    xOffset: baseLength,
    length: tipLength,
    width: width,
  });

  const leafBottomBoundary = [...baseBottomBoundary, ...tipBottomBoundary]
    .reverse()
    .map((v) => {
      const position = vec3.multiply(
        v.position,
        v.position,
        vec3.fromValues(-1, 1, 1),
      );

      return { ...v, position };
    });

  const leafBoundary = [...leafTopBoundary, ...leafBottomBoundary];
  applyTexcoordsToBoundary(leafBoundary);

  return leafBoundary;
};

const getPointsForSegment = ({
  segmentCurve,
  noSamples,
  xOffset,
  length,
  width,
}: {
  segmentCurve: NormalisedCurve;
  width: number;
  length: number;
  xOffset: number;
  noSamples: number;
}): PrimitiveVertex[] => {
  return sampleInterval(0, 1, noSamples)
    .map((t) => segmentCurve.get(t))
    .map((v) => {
      const position = vec3.fromValues(
        v[1] * width,
        0,
        -(v[0] * length + xOffset),
      );
      return { position };
    });
};

// The top half of a rounded base
const roundedBaseCurve = new NormalisedCurve(
  new Bezier(
    { x: 0, y: 0 },
    { x: 0, y: 0.6 },
    { x: 0.6, y: 1 },
    { x: 1, y: 1 },
  ),
);

// The top half of a rounded tip
const roundedTipCurve = new NormalisedCurve(
  new Bezier(
    { x: 0, y: 1 },
    { x: 0.6, y: 1 },
    { x: 1, y: 0.6 },
    { x: 1, y: 0 },
  ),
);
