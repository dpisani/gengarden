import Bezier from "bezier-js";
import { vec3 } from "gl-matrix";
import { flatMap } from "lodash-es";
import { prng } from "seedrandom";

import { quat } from "gl-matrix";
import {
  generateOppositeStemArrangement,
  PlacementScheme,
} from "../../stem-arrangement/opposite-arrangement/index.ts";
import { StemAxisBlueprint } from "../../stem-axis/index.ts";
import generateStemAxis from "../../stem-axis/keypoint-stem-axis/generators/random-walk.ts";
import { KeypointStemAxisBlueprint } from "../../stem-axis/keypoint-stem-axis/index.ts";
import { NormalisedCurve } from "../../util/curves.ts";
import { clamp, lerp, sampleInterval } from "../../util/math.ts";

const STALKS_PER_LENGTH_UNIT = 3;
const SEGMENTS_PER_STEM_LENGTH = 2;
const LEAVES_PER_STALK_LENGTH = 12;
const GLOBAL_UP = vec3.fromValues(0, 1, 0);

export const generateCompoundLeaves = ({
  stemBlueprints,
  rng,
}: {
  stemBlueprints: KeypointStemAxisBlueprint[];
  rng: prng;
}): {
  stalkBlueprints: KeypointStemAxisBlueprint[];
  leafBlueprints: LeafBlueprint[];
} => {
  const stalkBlueprints = generateAlternateLeafStalks(stemBlueprints, rng);
  return {
    stalkBlueprints,
    leafBlueprints: flatMap(stalkBlueprints, (s) =>
      generateLeavesForStem({ stemBlueprint: s, rng }),
    ),
  };
};

const getNoSegments = (length, segmentsPerLength = SEGMENTS_PER_STEM_LENGTH) =>
  Math.ceil(length * segmentsPerLength);

const generateAlternateLeafStalks = (
  stemBps: StemAxisBlueprint[],
  rng: prng,
): KeypointStemAxisBlueprint[] => {
  return flatMap(
    stemBps,
    (stemBp: StemAxisBlueprint): KeypointStemAxisBlueprint[] => {
      const noStalks = Math.round(stemBp.length * STALKS_PER_LENGTH_UNIT);

      const leafStalkPositions = sampleInterval(0.2, 1, noStalks);

      const stalkDivergenceCurve = new NormalisedCurve(
        new Bezier({ x: 0, y: 0.8 }, { x: 0.9, y: 0.6 }, { x: 1.1, y: 0.1 }),
      );

      const stalkArrangement = generateOppositeStemArrangement({
        axis: stemBp,
        nodePositions: leafStalkPositions,
        nodeDivergenceLookup: (t: number) =>
          stalkDivergenceCurve.valueAt(t) * Math.PI * 0.25,
        nodePlacementRotation: rng() * Math.PI * 2,
        placementScheme: PlacementScheme.ALTERNATING,
        rng,
      });

      const maxStalkSize = stemBp.length * 0.5;
      const minStalkSize = maxStalkSize * 0.2;

      return stalkArrangement.nodes.map((node) => {
        const stemLength = lerp(
          maxStalkSize,
          minStalkSize,
          node.branchPosition,
        );

        const stemWidth = Math.max(node.size * 0.7, 0.003);

        return generateStemAxis({
          start: node.position,
          direction: node.direction,
          length: stemLength,
          width: stemWidth,
          segments: getNoSegments(stemLength),
          rng,
        });
      });
    },
  );
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
  stemBlueprint: StemAxisBlueprint;
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
    nodePlacementRotation: lerp(0, Math.PI * 0.1, rng()),
    placementScheme: PlacementScheme.ALTERNATING,
    rng,
  });

  const sizeCurve = new NormalisedCurve(
    new Bezier({ x: 0, y: 0.3 }, { x: 0.7, y: 0.25 }, { x: 1, y: 0.1 }),
  );

  const getLeafSize = (t: number) => {
    // Limit the range of sizes that can be sampled from the curve for smaller stems

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
      node.branchPosition,
    ).axisDirection;
    const normalRotation = rotateBetween(
      GLOBAL_UP,
      forward,
      Math.PI * 0.01 * pitchCurve.valueAt(node.branchPosition),
    );
    const normal = vec3.transformQuat(vec3.create(), GLOBAL_UP, normalRotation);

    return {
      length: leafSize * 0.05,
      width: leafSize * 0.015,
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
