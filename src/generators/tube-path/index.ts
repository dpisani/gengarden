import { vec3 } from 'gl-matrix';

import { TaggedSpec, GeneratorDefinition } from '../../types';

import { TaggedTubeSpec } from '../tube';

interface PathSegment {
  position: vec3;
  width: number;
}

export interface TaggedTubePathSpec extends TaggedSpec {
  type: 'tubePath';
  spec: {
    segments: PathSegment[];
  };
}

export function isValidSpec(
  taggedSpec: TaggedSpec,
): taggedSpec is TaggedTubePathSpec {
  const { type } = taggedSpec;

  return type === 'tubePath';
}

export function generate({ spec }: TaggedTubePathSpec): TaggedSpec {
  const items: TaggedTubeSpec[] = [];

  for (let i = 0; i < spec.segments.length - 1; i++) {
    const s1 = spec.segments[i];
    const s2 = spec.segments[i + 1];
    items.push({
      type: 'tube',
      spec: {
        begin: { position: s1.position, width: s1.width },
        end: { position: s2.position, width: s2.width },
      },
    });
  }

  return {
    type: 'group',
    spec: {
      items,
    },
  };
}

const generatorDefinition: GeneratorDefinition<TaggedTubePathSpec> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
