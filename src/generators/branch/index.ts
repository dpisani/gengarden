import * as BezierSpline from 'bezier-spline';
import { quat, vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';
import { prng } from 'seedrandom';

import generateTubePath from '../tube-path';

import createDeviation from '../util/create-devitaion';

export interface BranchSpec {
  start: vec3;
  direction: vec3; // initial direction to grow the branch
  length: number;
  rng: prng;
  segments: number; // number of segments within the branch
  width: number; // initial width of the branch
}

export interface BranchSite {
  position: vec3;
  normal: vec3;
  width: number;
  remainingParentLength: number; // the amount of length on the parent branch after this site
}

interface GeneratedType {
  model: Node;
  // Potential sites for offshoots
  branchSites: BranchSite[];
}

const getSplineValue = (spline: BezierSpline, x: number): number => {
  const knots: Array<[number, number]> = spline.knots;
  const matchingKnot = knots.find(k => k[0] === x);
  if (matchingKnot) {
    return matchingKnot[1];
  }

  const matchingPoints: Array<[number, number]> = spline.getPoints(0, x);
  if (!matchingPoints.length) {
    throw new Error('cannot calculate spline value');
  }

  return matchingPoints[0][1];
};

const generate = (spec: BranchSpec): GeneratedType => {
  const segments: Array<{ position: vec3; width: number }> = [
    { position: spec.start, width: spec.width },
  ];
  const branchSites: BranchSite[] = [];

  let currentPos = spec.start;
  let currentDir = spec.direction;

  const widthCurve = new BezierSpline([[0, 1], [0.6, 0.5], [1, 0]]);

  const segmentLength = spec.length / spec.segments;

  for (let i = 1; i <= spec.segments; i++) {
    const nextWidth =
      spec.width * getSplineValue(widthCurve, i / spec.segments);

    const growth = vec3.scale(
      vec3.create(),
      vec3.normalize(vec3.create(), currentDir),
      segmentLength,
    );

    const nextPoint = {
      position: vec3.add(vec3.create(), currentPos, growth),
      width: nextWidth,
    };

    // create some potential branch sites
    const mainDeviation = createDeviation(
      currentDir,
      Math.PI * 0.15,
      Math.PI * 0.2,
      spec.rng,
    );

    const rotateQuat = quat.setAxisAngle(
      quat.create(),
      currentDir,
      Math.PI * 2,
    );
    const candidateBranches: BranchSite[] = [
      mainDeviation,
      vec3.transformQuat(vec3.create(), mainDeviation, rotateQuat),
    ].map(normal => ({
      normal,
      position: nextPoint.position,
      remainingParentLength: spec.length - segmentLength * i,
      width: nextWidth,
    }));

    currentPos = nextPoint.position;
    // use one of the branch sites for the next iteration
    const branchSite = candidateBranches.pop();
    currentDir = branchSite ? branchSite.normal : currentDir;

    segments.push(nextPoint);
    branchSites.push(...candidateBranches);
  }

  const tubePath = generateTubePath({
    segments,
  });

  return { model: tubePath, branchSites };
};

export default generate;
