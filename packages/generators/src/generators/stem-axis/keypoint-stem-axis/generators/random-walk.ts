import Bezier from "bezier-js";
import { quat, vec3 } from "gl-matrix";
import { prng } from "seedrandom";
import { BoundingVolume } from "../../../../bounding-volumes/types.ts";
import { createDeviation } from "../../../util/create-devitaion.ts";
import { NormalisedCurve } from "../../../util/curves.ts";
import { getRandom } from "../../../util/math.ts";
import { KeypointStemAxisBlueprint } from "../index.ts";

export interface StemSpec {
  start: vec3;
  deviationRange?: [number, number]; // Range for how much the branch can turn per segment, in radians
  direction: vec3; // initial direction to grow the branch
  length: number;
  rng: prng;
  segments: number; // number of segments within the branch
  width: number; // initial width of the branch
  boundingVolume?: BoundingVolume; // BV determining the space this branch must fit within
}

export default (spec: StemSpec): KeypointStemAxisBlueprint => {
  return new KeypointStemAxisBlueprint(generateKeypoints(spec));
};

const widthCurve = new NormalisedCurve(
  new Bezier({ x: 0, y: 1 }, { x: 0.6, y: 0.5 }, { x: 1, y: 0.01 }),
);

const generateKeypoints = (
  spec: StemSpec,
): Array<{ position: vec3; width: number }> => {
  const keyPoints: vec3[] = [spec.start];

  let currentPos = spec.start;
  let currentDir = spec.direction;

  const segmentLength = spec.length / spec.segments;

  const deviationRange = spec.deviationRange || [
    Math.PI * 0.11,
    Math.PI * 0.16,
  ];

  const noNodes = spec.segments + 1;

  const widthAtIndex = (i) => spec.width * widthCurve.valueAt(i / noNodes);

  for (let i = 1; i < noNodes; i++) {
    const growth = vec3.scale(
      vec3.create(),
      vec3.normalize(vec3.create(), currentDir),
      segmentLength,
    );

    const nextPoint = vec3.add(vec3.create(), currentPos, growth);

    // create some potential branch sites
    const mainDeviation = createDeviation(
      currentDir,
      getRandom(deviationRange[0], deviationRange[1], spec.rng),
      getRandom(0, Math.PI * 2, spec.rng),
    );

    const rotateQuat = quat.setAxisAngle(quat.create(), currentDir, Math.PI);
    const candidateBranches = [
      mainDeviation,
      vec3.transformQuat(vec3.create(), mainDeviation, rotateQuat),
    ].map((normal) => ({
      normal,
      position: nextPoint,
      remainingParentLength: spec.length - segmentLength * i,
    }));

    // use one of the branch sites for the next iteration
    const branchSite = candidateBranches.find((candidate) => {
      if (!spec.boundingVolume) {
        return true;
      }

      return spec.boundingVolume.containsPoint(candidate.position);
    });

    currentDir = branchSite ? branchSite.normal : currentDir;

    currentPos = nextPoint;

    keyPoints.push(nextPoint);
  }

  const segments: Array<{ position: vec3; width: number }> = keyPoints.map(
    (k, i) => ({
      position: k,
      width: widthAtIndex(i),
    }),
  );

  return segments;
};
