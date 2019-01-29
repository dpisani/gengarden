import { vec3 } from 'gl-matrix';

import { TaggedSpec, GeneratorDefinition, PartialSpec } from '../../types';

import { TaggedTubePathSpec } from '../tube-path';
import { TaggedGroupSpec } from '../group';

interface KeyPoint {
  position: vec3;
  width: number;
}

export interface BranchSpec {
  keyPoints: KeyPoint[];
}

export interface TaggedBranchSpec extends TaggedSpec<BranchSpec> {
  type: 'branch';
}

const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedBranchSpec => {
  const { type, spec } = taggedSpec;

  return type === 'branch' && spec.keyPoints.length;
};

const generate = (spec: BranchSpec): PartialSpec<TaggedGroupSpec> => {
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
  BranchSpec,
  PartialSpec<TaggedGroupSpec>
> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
