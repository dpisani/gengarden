import Bezier from 'bezier-js';
import { vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';
import { prng } from 'seedrandom';

import { BoundingVolume } from '../../bounding-volumes/types';
import generateTubePath from '../tube-path';

import BranchBlueprint from './blueprint';

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
  direction: vec3;
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
    direction: vec3;
    remainingParentLength: number;
  }>;
}

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

const checkInvariants = (spec: BranchSpec) => {
  if (spec.segments < 1) {
    throw new Error('Branch must have at least 1 segment.');
  }
};

const generate = (spec: BranchSpec): GeneratedType => {
  checkInvariants(spec);

  const deviationRange = spec.deviationRange || [
    Math.PI * 0.11,
    Math.PI * 0.16,
  ];

  const branchModel = new BranchBlueprint(spec);

  // create branch sites at regular intervals
  const branchSites: BranchSite[] = [];
  for (let i = 1; i <= spec.segments; i++) {
    const branchPos = spec.length * (i / spec.segments);

    branchSites.push({
      ...branchModel.getBranchSiteAt(branchPos, deviationRange, spec.rng),
      remainingParentLength: spec.length - branchPos,
    });
  }

  const tubePath = generateTubePath({
    segments: branchModel.keyPoints,
  });

  return { model: tubePath, branchSites };
};

export default generate;
