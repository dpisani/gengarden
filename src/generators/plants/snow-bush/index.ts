import { mat4, quat, vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../../types';
import generateBranch, { BranchSite } from '../../branch';

import getRandomGenerator from '../../util/get-random-generator';

const TYPE_LABEL = 'snow-bush';

const SEGMENTS_PER_BRANCH_LENGTH = 2;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.05;

interface SnowBushSpec {
  randomSeed?: string;
}

interface TaggedSnowBushSpec extends TaggedSpec<SnowBushSpec> {
  type: typeof TYPE_LABEL;
}

const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedSnowBushSpec => {
  const { type } = taggedSpec;

  return type === TYPE_LABEL;
};

const getNoSegments = (
  length,
  segmentsPerLength = SEGMENTS_PER_BRANCH_LENGTH,
) => length * segmentsPerLength;

const generate = (spec: SnowBushSpec): Node => {
  const rng = getRandomGenerator(spec.randomSeed);

  // generate main branches
  const startBranch = generateBranch({
    deviationRange: [Math.PI * 0.04, Math.PI * 0.07],
    direction: vec3.fromValues(0, 1, 0),
    length: MAIN_BRANCH_LENGTH,
    rng,
    segments: getNoSegments(MAIN_BRANCH_LENGTH, 3),
    start: vec3.fromValues(0, 0, 0),
    width: MAIN_BRANCH_WIDTH,
  });

  const secondBranch = generateBranch({
    deviationRange: [Math.PI * 0.03, Math.PI * 0.05],
    direction: startBranch.branchSites[1].direction,
    length: startBranch.branchSites[1].remainingParentLength * 0.7,
    rng,
    segments: getNoSegments(MAIN_BRANCH_LENGTH * 0.7),
    start: startBranch.branchSites[1].position,
    width: startBranch.branchSites[1].width,
  });

  const thirdBranch = generateBranch({
    deviationRange: [Math.PI * 0.03, Math.PI * 0.05],
    direction: startBranch.branchSites[2].direction,
    length: startBranch.branchSites[2].remainingParentLength * 0.8,
    rng,
    segments: getNoSegments(MAIN_BRANCH_LENGTH * 0.6),
    start: startBranch.branchSites[2].position,
    width: startBranch.branchSites[2].width,
  });

  return new Node()
    .addChild(startBranch.model)
    .addChild(secondBranch.model)
    .addChild(thirdBranch.model);
};

export const snowBushGeneratorDefinition: GeneratorDefinition<
  SnowBushSpec,
  Node
> = {
  generate,
  isValidSpec,
};

export default generate;
