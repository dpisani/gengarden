import { mat4, quat, vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../types';

import generateBranch, { BranchSite } from '../branch';
import generateGroup from '../group';
import generateLeaf from '../leaf';

import BoundingBox from '../../bounding-volumes/box';

import getRandomGenerator from '../util/get-random-generator';

const SEGMENTS_PER_LENGTH = 8;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.05;

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
    width: MAIN_BRANCH_WIDTH,
  });

  generatedModels.push(startBranch.model);
  potentialBranchSites.push(...startBranch.branchSites);

  while (potentialBranchSites.length > 0) {
    const candidateBranch = potentialBranchSites.pop();

    const randomNo = rng();

    // Discard candidate with a probability
    if (randomNo < 0.3 || !candidateBranch || candidateBranch.position[1] < 0) {
      continue;
    }

    // Create a new branch
    if (randomNo < 0.6 && candidateBranch.remainingParentLength > 1) {
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

      continue;
    }

    // Create a leaf
    const leafTransform = mat4.fromTranslation(
      mat4.create(),
      candidateBranch.position,
    );

    const rotationMat = mat4.rotateX(
      mat4.create(),
      mat4.create(),
      -Math.PI * 0.5,
    );
    const lookatMat = mat4.targetTo(
      mat4.create(),
      vec3.create(),
      candidateBranch.normal,
      vec3.fromValues(0, 1, 0),
    );
    mat4.mul(rotationMat, lookatMat, rotationMat);

    mat4.mul(leafTransform, leafTransform, rotationMat);

    const leafTranslate = mat4.getTranslation(vec3.create(), leafTransform);
    const leafRotation = mat4.getRotation(quat.create(), leafTransform);

    const leafSize = candidateBranch.width / MAIN_BRANCH_WIDTH;
    generatedModels.push(
      generateLeaf({
        length: 0.6 * leafSize + 0.1,
        randomSeed: rng().toString(),
        width: 0.2 * leafSize + 0.05,
      })
        .translation(leafTranslate[0], leafTranslate[1], leafTranslate[2])
        .rotation(
          leafRotation[0],
          leafRotation[1],
          leafRotation[2],
          leafRotation[3],
        ),
    );
  }

  return generateGroup({ items: generatedModels });
};

export const plantGeneratorDefinition: GeneratorDefinition<PlantSpec, Node> = {
  generate,
  isValidSpec,
};

export default generate;
