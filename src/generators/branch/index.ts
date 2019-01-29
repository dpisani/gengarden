import { vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';

import { TaggedSpec, GeneratorDefinition } from '../../types';

import tubePathGenerator from '../tube-path';
import groupGenerator from '../group';

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

const generate = (spec: BranchSpec): Node => {
  const tubePath = tubePathGenerator.generate({
    segments: spec.keyPoints,
  });

  return groupGenerator.generate({
    items: [tubePath],
  });
};

const generatorDefinition: GeneratorDefinition<BranchSpec, Node> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
