import BranchBlueprint from '../../branch/blueprint';
import { prng } from 'seedrandom';
import { flatMap } from 'lodash';
import { vec3 } from 'gl-matrix';
import { mat4 } from 'gl-matrix';
import Bezier from 'bezier-js';

import { NormalisedCurve } from '../../util/curves';
import { generateOppositeStemArrangement } from '../../stem-arrangement/opposite-arrangement';
import { quat } from 'gl-matrix';
import { mat3 } from 'gl-matrix';
import { clamp, lerp } from '../../util/math';

const STALKS_PER_LENGTH_UNIT = 2;
const SEGMENTS_PER_STEM_LENGTH = 2;
const LEAVES_PER_STALK_LENGTH = 7;
const GLOBAL_UP = vec3.fromValues(0, 1, 0);

const getNoSegments = (length, segmentsPerLength = SEGMENTS_PER_STEM_LENGTH) =>
  Math.ceil(length * segmentsPerLength);

const generateLeafStalks = (
  stemBps: BranchBlueprint[],
  rng: prng,
): BranchBlueprint[] => {
  return flatMap(
    stemBps,
    (stemBp: BranchBlueprint): BranchBlueprint[] => {
      const noStalks = Math.round(stemBp.length * STALKS_PER_LENGTH_UNIT);

      const stalks: BranchBlueprint[] = [];
      for (let i = 0; i < noStalks; i++) {
        // find position from the end part of branch
        const branchPos = (1 - rng() * 0.7) * stemBp.length;

        const branchPoint = stemBp.getBranchSiteAt(
          branchPos,
          [Math.PI * 0.4, Math.PI * 0.5],
          rng,
        );

        const stemLength = (stemBp.length - branchPos) * 0.7;

        stalks[i] = new BranchBlueprint({
          start: branchPoint.position,
          direction: branchPoint.direction,
          length: stemLength,
          width: branchPoint.width * 0.7,
          segments: getNoSegments(stemLength),
          rng,
        });
      }

      return stalks;
    },
  );
};

export const generateCompoundLeaves = ({
  stemBlueprints,
  rng,
}: {
  stemBlueprints: BranchBlueprint[];
  rng: prng;
}): { stalkBlueprints: BranchBlueprint[]; leafBlueprints: LeafBlueprint[] } => {
  const stalkBlueprints = generateLeafStalks(stemBlueprints, rng);
  return {
    stalkBlueprints,
    leafBlueprints: flatMap(stalkBlueprints, s =>
      generateLeavesForStem({ stemBlueprint: s, rng }),
    ),
  };
};

export interface LeafBlueprint {
  length: number;
  width: number;
  position: vec3;
  direction: vec3;
  // vector indicating the direction the leaf surface is pointing
  normal: vec3;
}

const generateLeavesForStem = ({
  stemBlueprint,
  rng,
}: {
  stemBlueprint: BranchBlueprint;
  rng: prng;
}): LeafBlueprint[] => {
  const stemCoverage = 0.9;
  const noLeaves = Math.round(
    stemCoverage * stemBlueprint.length * LEAVES_PER_STALK_LENGTH,
  );

  if (noLeaves < 1) {
    return [];
  }

  // place leaves uniformly
  const nodePositions: number[] = [];
  const leafSpacing = stemCoverage / noLeaves;
  for (let i = 0; i < noLeaves; i++) {
    // place from tip backwards
    const leafPos = 1 - leafSpacing * i;
    nodePositions[i] = leafPos;
  }

  const arrangement = generateOppositeStemArrangement({
    axis: stemBlueprint,
    nodePositions,
    nodeDivergenceLookup: () => Math.PI * 0.3 + rng() * 0.1,
    nodePlacementRotation: 0,
    rng,
  });

  const sizeCurve = new NormalisedCurve(
    new Bezier({ x: 0, y: 0.3 }, { x: 0.7, y: 0.25 }, { x: 1, y: 0.1 }),
  );

  const getLeafSize = (t: number) => {
    const BIG_STEM_SIZE = 2;
    const range = clamp(stemBlueprint.length, 0, BIG_STEM_SIZE) / BIG_STEM_SIZE;

    const u = lerp(1 - range, 1, t);

    return sizeCurve.valueAt(u);
  };

  const pitchCurve = new NormalisedCurve(
    new Bezier({ x: 0, y: 0.5 }, { x: 0.1, y: 0.3 }, { x: 1, y: 0.1 }),
  );

  return arrangement.nodes.map((node, i) => {
    const leafSize = getLeafSize(node.branchPosition);

    const forward = stemBlueprint.getAxisInfoAt(
      node.branchPosition * stemBlueprint.length,
    ).axisDirection;
    const normalRotation = rotateBetween(
      GLOBAL_UP,
      forward,
      Math.PI * 0.01 * pitchCurve.valueAt(node.branchPosition),
    );
    const normal = vec3.transformQuat(vec3.create(), GLOBAL_UP, normalRotation);

    return {
      length: leafSize * 0.05,
      width: leafSize * 0.02,
      position: node.position,
      direction: node.direction,
      normal,
    };
  });
};

const rotateBetween = (a: vec3, b: vec3, t: number): quat => {
  const fullRotation = quat.rotationTo(quat.create(), a, b);

  return quat.slerp(quat.create(), quat.create(), fullRotation, t);
};
