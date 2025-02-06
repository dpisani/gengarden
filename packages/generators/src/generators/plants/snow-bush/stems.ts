import gaussian from "gaussian";
import { vec3 } from "gl-matrix";
import { buildTextureFromArrayBuffer, Node, Sampler } from "gltf-builder";
import { prng } from "seedrandom";

import { flatMap } from "lodash-es";
import { generateMesh } from "../../mesh/index.ts";
import generateScatteredStemArrangement from "../../stem-arrangement/scattered-arrangement/index.ts";
import { StemAxisBlueprint } from "../../stem-axis/index.ts";
import generateStemAxis from "../../stem-axis/keypoint-stem-axis/generators/random-walk.ts";
import { KeypointStemAxisBlueprint } from "../../stem-axis/keypoint-stem-axis/index.ts";
import { generateTubePathFromStemAxis } from "../../tube-path/from-stem-axis.ts";
import { clamp, getRandomInt } from "../../util/math.ts";
import { generateSnowBushStemTexture } from "./textures/stem-texture.ts";

const SEGMENTS_PER_BRANCH_LENGTH = 2;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.03;

const getNoSegments = (
  length,
  segmentsPerLength = SEGMENTS_PER_BRANCH_LENGTH,
) => length * segmentsPerLength;

export const generateStemBlueprints = ({
  rng,
}: {
  rng: prng;
}): KeypointStemAxisBlueprint[] => {
  const mainBranchBP = generateStemAxis({
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

export const generateStemModel = async ({
  blueprints,
}: {
  blueprints: KeypointStemAxisBlueprint[];
}): Promise<Node> => {
  const model = new Node();

  const textureData = await generateSnowBushStemTexture({ size: 32 });

  const { texture } = buildTextureFromArrayBuffer(textureData, "image/jpeg");

  const sampler = new Sampler()
    .wrapS(Sampler.WrapModes.CLAMP_TO_EDGE)
    .wrapT(Sampler.WrapModes.CLAMP_TO_EDGE);

  texture.sampler(sampler);

  for (let bp of blueprints) {
    model.addChild(
      new Node().mesh(
        generateMesh(generateTubePathFromStemAxis(bp, { texture })),
      ),
    );
  }

  return model;
};

// Recursively creates offshoot branches on a main set of branches
const generateDescendantBranches = (
  mainBranches: StemAxisBlueprint[],
  maxDescendantsPerBranch: number,
  rng: prng,
): KeypointStemAxisBlueprint[] => {
  const firstDescendants = flatMap(
    mainBranches,
    (branchBp: StemAxisBlueprint): KeypointStemAxisBlueprint[] => {
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
  stemBp: StemAxisBlueprint,
  noOffshoots: number,
  rng: prng,
): KeypointStemAxisBlueprint[] => {
  const offshootPositions: number[] = [];

  const offshootDistribution = gaussian(0, 0.09);
  for (let i = 0; i < noOffshoots; i++) {
    const sample = offshootDistribution.ppf(rng());
    offshootPositions[i] = Math.abs(clamp(sample, -1, 1)) * 0.9;
  }

  const offshootArrangement = generateScatteredStemArrangement({
    axis: stemBp,
    nodePositions: offshootPositions,
    deviationRange: [Math.PI * 0.05, Math.PI * 0.07],
    rng,
  });

  return offshootArrangement.nodes.map((offshootPoint) => {
    const offshootLength =
      stemBp.length * (1 - offshootPoint.branchPosition) * 0.85;

    return generateStemAxis({
      deviationRange: [Math.PI * 0.04, Math.PI * 0.1],
      direction: offshootPoint.direction,
      length: offshootLength,
      rng,
      segments: getNoSegments(offshootLength),
      start: offshootPoint.position,
      width: offshootPoint.size,
    });
  });
};
