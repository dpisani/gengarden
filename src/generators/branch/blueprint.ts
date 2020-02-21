import Bezier from 'bezier-js';
import { quat, vec3 } from 'gl-matrix';

import createDeviation from '../util/create-devitaion';

import { BranchSpec } from './index';
import { prng } from 'seedrandom';

const getSplineValue = (spline: Bezier, x: number): number => {
  const intersections = spline.lineIntersects({
    p1: { x, y: 0 },
    p2: { x, y: 1 },
  });

  if (intersections.length !== 1) {
    throw new Error('cannot calculate spline value');
  }

  return spline.get(intersections[0]).y;
};

export default class BranchBlueprint {
  readonly keyPoints: { position: vec3; width: number }[];
  readonly length: number;
  private width: number;

  private widthCurve = new Bezier(
    { x: 0, y: 1 },
    { x: 0.6, y: 0.5 },
    { x: 1, y: 0 },
  );

  checkInvariants = (spec: BranchSpec) => {
    if (spec.segments < 1) {
      throw new Error('Branch must have at least 1 segment.');
    }
  };

  constructor(spec: BranchSpec) {
    this.checkInvariants(spec);

    this.keyPoints = this.generateKeypoints(spec);
    this.length = spec.length;
    this.width = spec.width;
  }

  public getBranchSiteAt(
    length: number,
    deviationRange: [number, number],
    rng: prng,
  ) {
    const branchPoint = this.getAxisInfoAt(length);

    return {
      position: branchPoint.position,
      direction: createDeviation(
        branchPoint.axisDirection,
        deviationRange[0],
        deviationRange[1],
        rng,
      ),
      width: branchPoint.width,
    };
  }

  // Get info about point along branch at point defined by the length up from the base
  public getAxisInfoAt = (
    length: number,
  ): {
    position: vec3;
    width: number;
    // the forward direction along the axis from this point
    axisDirection: vec3;
  } => {
    if (length < 0 || length > this.length) {
      throw new Error('Invalid length');
    }

    // get last keypoint before branching point
    let prevKeypoint = {
      lastIdx: 0,
      totalLength: 0,
    };
    for (let i = 0; i < this.keyPoints.length; i++) {
      const segmentDistance = vec3.length(
        vec3.sub(
          vec3.create(),
          this.keyPoints[prevKeypoint.lastIdx].position,
          this.keyPoints[i].position,
        ),
      );

      const totalLength = prevKeypoint.totalLength + segmentDistance;
      if (totalLength > length) {
        break;
      }

      prevKeypoint = {
        lastIdx: i,
        totalLength,
      };
    }

    const remainingLength = length - prevKeypoint.totalLength;

    const segmentDir =
      prevKeypoint.lastIdx === this.keyPoints.length - 1
        ? vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.keyPoints[prevKeypoint.lastIdx].position,
              this.keyPoints[prevKeypoint.lastIdx - 1].position,
            ),
          )
        : vec3.normalize(
            vec3.create(),
            vec3.sub(
              vec3.create(),
              this.keyPoints[prevKeypoint.lastIdx + 1].position,
              this.keyPoints[prevKeypoint.lastIdx].position,
            ),
          );

    const position = vec3.add(
      vec3.create(),
      this.keyPoints[prevKeypoint.lastIdx].position,
      vec3.scale(vec3.create(), segmentDir, remainingLength),
    );
    const width =
      this.width * getSplineValue(this.widthCurve, length / this.length);

    return { position, width, axisDirection: segmentDir };
  };

  private generateKeypoints = (
    spec: BranchSpec,
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

    const widthAtIndex = i =>
      spec.width * getSplineValue(this.widthCurve, i / noNodes);

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
        deviationRange[0],
        deviationRange[1],
        spec.rng,
      );

      const rotateQuat = quat.setAxisAngle(quat.create(), currentDir, Math.PI);
      const candidateBranches = [
        mainDeviation,
        vec3.transformQuat(vec3.create(), mainDeviation, rotateQuat),
      ].map(normal => ({
        normal,
        position: nextPoint,
        remainingParentLength: spec.length - segmentLength * i,
      }));

      // use one of the branch sites for the next iteration
      const branchSite = candidateBranches.find(candidate => {
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
}
