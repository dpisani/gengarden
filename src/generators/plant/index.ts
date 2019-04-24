import { vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../types';

import generateBranch, { BranchSite } from '../branch';
import generateGroup from '../group';

import getRandomGenerator from '../util/get-random-generator';

const SEGMENTS_PER_LENGTH = 1.5;
const MAIN_BRANCH_LENGTH = 10;

interface PlantSpec {
  randomSeed?: string;
}

interface TaggedPlantSpec extends TaggedSpec<PlantSpec> {
  type: 'plant';
}

const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedPlantSpec => {
  const { type } = taggedSpec;

  return type === 'plant';
};

const getNoSegments = length => length * SEGMENTS_PER_LENGTH;

const generate = (spec: PlantSpec): Node => {
  const rng = getRandomGenerator(spec.randomSeed);

  const generatedModels: Node[] = [];
  const potentialBranchSites: BranchSite[] = [];

  const startBranch = generateBranch({
    direction: vec3.fromValues(0, 1, 0),
    length: MAIN_BRANCH_LENGTH,
    rng,
    segments: getNoSegments(MAIN_BRANCH_LENGTH),
    start: vec3.fromValues(0, 0, 0),
    width: 0.05,
  });

  generatedModels.push(startBranch.model);
  potentialBranchSites.push(...startBranch.branchSites);

  while (potentialBranchSites.length > 0) {
    const candidateBranch = potentialBranchSites.pop();

    const randomNo = rng();

    // Discard candidate with a probability
    if (
      randomNo < 0.5 ||
      !candidateBranch ||
      candidateBranch.remainingParentLength <= 1
    ) {
      continue;
    }

    // Create a new branch
    const newBranchLength = candidateBranch.remainingParentLength * 0.7;
    const branch = generateBranch({
      direction: candidateBranch.normal,
      length: newBranchLength,
      rng,
      segments: getNoSegments(newBranchLength),
      start: candidateBranch.position,
      width: candidateBranch.width,
    });

    generatedModels.push(branch.model);
    potentialBranchSites.push(...branch.branchSites);
  }

  return generateGroup({ items: generatedModels });
};

export const plantGeneratorDefinition: GeneratorDefinition<PlantSpec, Node> = {
  generate,
  isValidSpec,
};

export default generate;
