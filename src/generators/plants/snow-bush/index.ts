import { mat4, quat, vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../../types';

import { generateStemBlueprints, generateStemModel } from './stems';

import getRandomGenerator from '../../util/get-random-generator';

const TYPE_LABEL = 'snow-bush';

const SEGMENTS_PER_BRANCH_LENGTH = 2;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.06;

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

  return generateStemModel({ blueprints: stems });
};

export const snowBushGeneratorDefinition: GeneratorDefinition<
  SnowBushSpec,
  Node
> = {
  generate,
  isValidSpec,
};

export default generate;
