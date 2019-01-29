import { vec3, mat4 } from 'gl-matrix';

import { TaggedSpec, GeneratorDefinition, PartialSpec } from '../../types';

import { TaggedTubeSpec } from '../tube';
import { TaggedGroupSpec } from '../group';
import createRing from '../../util/create-ring';
import { zip } from 'lodash';

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

export function generate({
  spec,
}: TaggedTubePathSpec): PartialSpec<TaggedGroupSpec> {
  const items: TaggedTubeSpec[] = [];

  const ringNormals: vec3[] = [];
  for (let i = 1; i < spec.segments.length; i++) {
    const s1 = spec.segments[i - 1];
    const s2 = spec.segments[i];

    const normal = vec3.create();
    vec3.sub(normal, s2.position, s1.position);

    ringNormals[i] = normal;
  }
  // since we can't know which way the first segment came from
  // just re use the second normal
  ringNormals[0] = ringNormals[1];

  const ringProto = createRing({ plane: 'xy' });

  const rings: vec3[][] = zip(ringNormals, spec.segments).map(
    ([n, segment]) => {
      if (!n || !segment) {
        throw new Error('Missing segment data');
      }
      const transform = mat4.create();

      const up = vec3.equals(
        vec3.normalize(vec3.create(), n),
        vec3.fromValues(0, 0, 1),
      )
        ? vec3.fromValues(0, 1, 0)
        : vec3.fromValues(0, 0.1, 0.9);

      mat4.targetTo(transform, vec3.create(), n, up);

      return ringProto.map(v =>
        vec3.add(
          vec3.create(),
          vec3.scale(
            vec3.create(),
            vec3.transformMat4(vec3.create(), v, transform),
            segment.width,
          ),
          segment.position,
        ),
      );
    },
  );

  for (let i = 0; i < spec.segments.length - 1; i++) {
    const r1 = rings[i];
    const r2 = rings[i + 1];
    items.push({
      type: 'tube',
      spec: {
        begin: r1,
        end: r2,
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

const generatorDefinition: GeneratorDefinition<
  TaggedTubePathSpec,
  PartialSpec<TaggedGroupSpec>
> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
