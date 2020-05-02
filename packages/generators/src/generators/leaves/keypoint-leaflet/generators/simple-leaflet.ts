import { KeypointLeafletBlueprint } from '../blueprint';
import Bezier from 'bezier-js';

import { NormalisedCurve } from '../../../util/curves';
import { KeypointStemAxisBlueprint } from '../../../stem-axis/keypoint-stem-axis';
import { vec3 } from 'gl-matrix';
import { sampleInterval } from '../../../util/math';
import BoundingBox, {
  createBoundingBoxFromPoints,
  createBoxTransformer,
} from '../../../../bounding-volumes/box';
import { MeshVertex } from '../../../mesh';
import { vec2 } from 'gl-matrix';

export interface GeneratorSpec {
  // Length of the stem section preceeding the main leaflet
  stemLength: number;
  stemWidth: number;
  leafletLength: number;
  leafletWidth: number;
  // Position of the widest part of the leaflet, expressed in the range [0,1]
  leafletMidpointPosition: number;
}

const checkInvariants = (
  spec: GeneratorSpec,
): { isValid: boolean; messages: string[] } => {
  let isValid = true;
  const messages: string[] = [];

  if (spec.leafletMidpointPosition < 0 || spec.leafletMidpointPosition > 1) {
    isValid = false;
    messages.push(
      `Expected leafletMidpointPosition to be in the range [0,1]. Instead got ${
        spec.leafletMidpointPosition
      }`,
    );
  }

  return { messages, isValid };
};

// Creates a leaflet by combining simple shapes for the base and tip of the blade.
// Leaflet is oriented along the xz plane pointing forward down the x axis.
export default (spec: GeneratorSpec): KeypointLeafletBlueprint => {
  const check = checkInvariants(spec);
  if (!check.isValid) {
    throw new Error(check.messages.join('\n'));
  }

  const {
    stemLength,
    stemWidth,
    leafletLength,
    leafletWidth,
    leafletMidpointPosition,
  } = spec;

  const fullLength = leafletLength + stemLength;
  const stemAxis = new KeypointStemAxisBlueprint([
    { position: vec3.fromValues(0, 0, 0), width: stemWidth },
    { position: vec3.fromValues(fullLength, 0, 0), width: 0 },
  ]);

  const topBlade = [
    vec3.fromValues(stemLength, 0, 0),
    vec3.fromValues(fullLength, leafletWidth, 0),
    vec3.fromValues(fullLength, 0, 0),
  ];

  const baseLength = leafletLength * leafletMidpointPosition;
  const tipLength = leafletLength * (1 - leafletMidpointPosition);

  const baseTopBoundary = getPointsForSegment({
    segmentCurve: roundedBaseCurve,
    noSamples: 3,
    xOffset: stemLength,
    length: baseLength,
    width: leafletWidth,
  });

  const tipTopBoundary = getPointsForSegment({
    segmentCurve: roundedTipCurve,
    noSamples: 4,
    xOffset: stemLength + baseLength,
    length: tipLength,
    width: leafletWidth,
  });

  const leafTopBoundary = [...baseTopBoundary, ...tipTopBoundary];

  const baseBottomBoundary = getPointsForSegment({
    segmentCurve: roundedBaseCurve,
    noSamples: 3,
    xOffset: stemLength,
    length: baseLength,
    width: leafletWidth,
  });

  const tipBottomBoundary = getPointsForSegment({
    segmentCurve: roundedTipCurve,
    noSamples: 4,
    xOffset: stemLength + baseLength,
    length: tipLength,
    width: leafletWidth,
  });

  const leafBottomBoundary = [...baseBottomBoundary, ...tipBottomBoundary]
    .reverse()
    .map(v => {
      const position = vec3.multiply(
        v.position,
        v.position,
        vec3.fromValues(1, -1, 1),
      );

      return { ...v, position };
    });

  const leafBoundary = [...leafTopBoundary, ...leafBottomBoundary];
  applyTexcoordsToBoundary(leafBoundary);

  return { stem: stemAxis, bladeBoundaries: [leafBoundary] };
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
}): MeshVertex[] => {
  return sampleInterval(0, 1, noSamples)
    .map(t => segmentCurve.get(t))
    .map(v => {
      const position = vec3.fromValues(
        v[0] * length + xOffset,
        v[1] * width,
        0,
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

const applyTexcoordsToBoundary = (boundary: MeshVertex[]) => {
  const leafBoundaryBox = createBoundingBoxFromPoints(
    boundary.map(p => p.position),
  );

  const texCoordBox = new BoundingBox(vec3.create(), vec3.fromValues(1, 1, 0));

  const transformToTexCoord = createBoxTransformer(
    leafBoundaryBox,
    texCoordBox,
  );

  boundary.forEach(v => {
    const transformed = transformToTexCoord(v.position);
    v.texcoord = vec2.fromValues(transformed[0], transformed[1]);
  });
};
