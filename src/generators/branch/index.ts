import { vec3 } from 'gl-matrix';

import { TaggedSpec, GeneratorDefinition, PartialSpec } from '../../types';

import { TaggedTubePathSpec } from '../tube-path';
import { TaggedGroupSpec } from '../group';

interface KeyPoint {
  position: vec3;
  width: number;
}

export interface TaggedBranchSpec extends TaggedSpec {
  type: 'branch';
  spec: {
    keyPoints: KeyPoint[];
  };
}

const isValidSpec = (
  taggedSpec: TaggedSpec,
): taggedSpec is TaggedBranchSpec => {
  const { type, spec } = taggedSpec;

  return type === 'branch' && spec.keyPoints.length;
};

const generate = ({ spec }: TaggedBranchSpec): PartialSpec<TaggedGroupSpec> => {
  const tubePath: TaggedTubePathSpec = {
    type: 'tubePath',
    spec: { segments: spec.keyPoints },
  };

  return {
    type: 'group',
    spec: { items: [tubePath] },
  };
};

const generatorDefinition: GeneratorDefinition<
  TaggedBranchSpec,
  PartialSpec<TaggedGroupSpec>
> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
