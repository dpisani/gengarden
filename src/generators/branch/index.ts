import * as BezierSpline from 'bezier-spline';
import { quat, vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';
import { flatten } from 'lodash';
import { prng } from 'seedrandom';

import { BoundingVolume } from '../../bounding-volumes/types';
import generateTubePath from '../tube-path';
import createDeviation from '../util/create-devitaion';

export interface BranchSpec {
  start: vec3;
  deviationRange?: [number, number]; // Range for how much the branch can turn per segment, in radians
  direction: vec3; // initial direction to grow the branch
  length: number;
  rng: prng;
  segments: number; // number of segments within the branch
  width: number; // initial width of the branch
  boundingVolume?: BoundingVolume; // BV determining the space this branch must fit within
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

interface BranchNode {
  keyPoint: vec3;
  branchSites: Array<{
    position: vec3;
    normal: vec3;
    remainingParentLength: number;
  }>;
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

const checkInvariants = (spec: BranchSpec) => {
  if (spec.segments < 1) {
    throw new Error('Branch must have at least 1 segment.');
  }
};

const generate = (spec: BranchSpec): GeneratedType => {
  checkInvariants(spec);
  // const keyPoints: vec3[] = [spec.start];

  // const branchSites: BranchSite[] = [];

  const branchNodes: BranchNode[] = [
    {
      branchSites: [],
      keyPoint: spec.start,
    },
  ];

  let currentPos = spec.start;
  let currentDir = spec.direction;

  const widthCurve = new BezierSpline([[0, 1], [0.6, 0.5], [1, 0]]);

  const segmentLength = spec.length / spec.segments;

  const deviationRange = spec.deviationRange || [
    Math.PI * 0.11,
    Math.PI * 0.16,
  ];

  const noNodes = spec.segments + 1;

  const widthAtIndex = i =>
    spec.width * getSplineValue(widthCurve, i / noNodes);

  for (let i = 1; i < noNodes; i++) {
    const growth = vec3.scale(
      vec3.create(),
      vec3.normalize(vec3.create(), currentDir),
      segmentLength,
    );

    const nextPoint = vec3.add(vec3.create(), currentPos, growth);

    let nextBranchSites;

    // make only one site if at the end
    if (i === spec.segments) {
      nextBranchSites = [
        {
          normal: currentDir,
          position: nextPoint,
          remainingParentLength: 0,
        },
      ];
    } else {
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

      nextBranchSites = candidateBranches.filter(
        c =>
          c !== branchSite &&
          (!spec.boundingVolume ||
            spec.boundingVolume.containsPoint(c.position)),
      );
    }

    currentPos = nextPoint;

    branchNodes.push({
      branchSites: nextBranchSites,
      keyPoint: nextPoint,
    });
  }

  const segments: Array<{ position: vec3; width: number }> = branchNodes.map(
    (n, i) => ({
      position: n.keyPoint,
      width: widthAtIndex(i),
    }),
  );

  const branchSites = branchNodes
    .map(n => n.branchSites)
    .map((sites, i) => {
      return sites.map(site => ({ ...site, width: widthAtIndex(i) }));
    });

  const tubePath = generateTubePath({
    segments,
  });

  return { model: tubePath, branchSites: flatten(branchSites) };
};

export default generate;
