import { mat4, quat, vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../../types';
import generateLeafModel from '../../leaf';

import { generateStemBlueprints, generateStemModel } from './stems';
import { generateCompoundLeaves, LeafBlueprint } from './compound-leaves';

import getRandomGenerator from '../../util/get-random-generator';
import { prng } from 'seedrandom';
import { flatMap } from 'lodash';
import { KeypointStemAxisBlueprint } from '../../stem-axis/keypoint-stem-axis';

const TYPE_LABEL = 'snow-bush';

const SEGMENTS_PER_BRANCH_LENGTH = 2;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.06;

const UP_VECTOR = vec3.fromValues(0, 1, 0);

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

const generate = (spec: SnowBushSpec): Node => {
  const rng = getRandomGenerator(spec.randomSeed);

  const stems = generateStemBlueprints({ rng });

  const stemModel = generateStemModel({ blueprints: stems });

  const leafBps = generateCompoundLeaves({
    stemBlueprints: stems.map(s => new KeypointStemAxisBlueprint(s.keyPoints)),
    rng,
  });
  // TODO: Replace this with stalk model generator
  const stalkModel = generateStemModel({ blueprints: leafBps.stalkBlueprints });

  const leafModel = generateLeavesModel(leafBps.leafBlueprints, rng);

  return new Node()
    .addChild(stemModel)
    .addChild(stalkModel)
    .addChild(leafModel);
};

const generateLeavesModel = (leafBps: LeafBlueprint[], rng: prng): Node => {
  const leaves = flatMap(leafBps, l => generateLeaf(l, rng));

  const node = new Node();

  for (let leaf of leaves) {
    node.addChild(leaf);
  }

  return node;
};

const generateLeaf = (leafBp: LeafBlueprint, rng: prng): Node => {
  const leafModel = generateLeafModel({
    length: leafBp.length,
    width: leafBp.width,
    randomSeed: rng().toString(),
  });

  // Orient leaf model along x axis before pointing in the right direction
  const leafRotationMat = mat4.rotateX(
    mat4.create(),
    mat4.create(),
    -Math.PI * 0.5,
  );

  const lookAt = mat4.targetTo(
    mat4.create(),
    vec3.create(),
    leafBp.direction,
    UP_VECTOR,
  );

  mat4.mul(leafRotationMat, lookAt, leafRotationMat);

  const leafRotation = mat4.getRotation(quat.create(), leafRotationMat);

  const normalRotation = quat.rotationTo(
    quat.create(),
    UP_VECTOR,
    leafBp.normal,
  );

  quat.mul(leafRotation, normalRotation, leafRotation);

  leafModel
    .translation(leafBp.position[0], leafBp.position[1], leafBp.position[2])
    .rotation(
      leafRotation[0],
      leafRotation[1],
      leafRotation[2],
      leafRotation[3],
    );

  return leafModel;
};

export const snowBushGeneratorDefinition: GeneratorDefinition<
  SnowBushSpec,
  Node
> = {
  generate,
  isValidSpec,
};

export default generate;
