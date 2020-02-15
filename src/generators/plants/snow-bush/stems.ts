import { vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';
import { Node } from 'gltf-builder';
import gaussian from 'gaussian';

import { generateModel as generateBranchModel } from '../../branch';
import BranchBlueprint from '../../branch/blueprint';
import { clamp, getRandomInt } from '../../util/math';
import { flatMap } from 'lodash';

const SEGMENTS_PER_BRANCH_LENGTH = 2;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.06;

const getNoSegments = (
  length,
  segmentsPerLength = SEGMENTS_PER_BRANCH_LENGTH,
) => length * segmentsPerLength;

export const generateStemBlueprints = ({
  rng,
}: {
  rng: prng;
}): BranchBlueprint[] => {
  const mainBranchBP = new BranchBlueprint({
    deviationRange: [Math.PI * 0.04, Math.PI * 0.05],
    direction: vec3.fromValues(0, 1, 0),
    length: MAIN_BRANCH_LENGTH,
    rng,
    segments: getNoSegments(MAIN_BRANCH_LENGTH, 3),
    start: vec3.fromValues(0, 0, 0),
    width: MAIN_BRANCH_WIDTH,
  });

  const descendantBranches = generateDescendantBranches([mainBranchBP], 2, rng);

  return [mainBranchBP, ...descendantBranches];
};

export const generateStemModel = ({
  blueprints,
}: {
  blueprints: BranchBlueprint[];
}) => {
  const model = new Node();

  for (let bp of blueprints) {
    model.addChild(generateBranchModel(bp));
  }

  return model;
};

// Recursively creates offshoot branches on a main set of branches
const generateDescendantBranches = (
  mainBranches: BranchBlueprint[],
  maxDescendantsPerBranch: number,
  rng: prng,
): BranchBlueprint[] => {
  const firstDescendants = flatMap(
    mainBranches,
    (branchBp: BranchBlueprint): BranchBlueprint[] => {
      const noOffshoots = getRandomInt(0, maxDescendantsPerBranch + 1, rng);
      return generateOffshoots(branchBp, noOffshoots, rng);
    },
  );

  const nextMaxDescendants = maxDescendantsPerBranch - 1;
  const remainingDescendants =
    nextMaxDescendants > 0
      ? generateDescendantBranches(firstDescendants, nextMaxDescendants, rng)
      : [];

  return [...firstDescendants, ...remainingDescendants];
};

// Create offshoot stems from a main branch
const generateOffshoots = (
  stemBp: BranchBlueprint,
  noOffshoots: number,
  rng: prng,
): BranchBlueprint[] => {
  const offshootPositions: number[] = [];

  const offshootDistribution = gaussian(0, 0.09);
  for (let i = 0; i < noOffshoots; i++) {
    const sample = offshootDistribution.ppf(rng());
    offshootPositions[i] = Math.abs(clamp(sample, -1, 1)) * stemBp.length * 0.9;
  }
  return offshootPositions.map(p => {
    const offshootPoint = stemBp.getBranchSiteAt(
      p,
      [Math.PI * 0.05, Math.PI * 0.07],
      rng,
    );

    const offshootLength = (stemBp.length - p) * 0.8;

    return new BranchBlueprint({
      deviationRange: [Math.PI * 0.04, Math.PI * 0.1],
      direction: offshootPoint.direction,
      length: offshootLength,
      rng,
      segments: getNoSegments(offshootLength),
      start: offshootPoint.position,
      width: offshootPoint.width,
    });
  });
};
