import {
  Node,
  Mesh,
  Primitive,
  buildIndices,
  buildPosition,
} from 'gltf-builder';
import { vec3 } from 'gl-matrix';
import { flatten } from 'lodash';

import { TaggedSpec, GeneratorDefinition } from '../../types';

interface BranchSpec {
  begin: { position: vec3; width: number };
  end: { position: vec3; width: number };
}

interface TaggedBranchSpec extends TaggedSpec {
  type: 'branch';
  spec: BranchSpec;
}

/**
 * validateSpec - Validates whether this spec can be handled by this generator
 *
 * @param {type} spec A spec
 *
 * @returns {boolean} Whether the spec is valid
 */
export const isValidSpec = (
  taggedSpec: TaggedSpec,
): taggedSpec is TaggedBranchSpec => {
  const { type, spec } = taggedSpec;
  if (
    type === 'branch' &&
    spec.begin &&
    spec.begin.position &&
    spec.begin.width &&
    spec.end &&
    spec.end.position &&
    spec.end.width
  ) {
    return true;
  }

  return false;
};

export const generate = ({ spec }: TaggedBranchSpec): Node => {
  const segments = 10;
  const segmentAngle = (Math.PI * 2) / segments;
  const ring: vec3[] = Array.from({ length: segments }).map((_x, i) => {
    const a = segmentAngle * i;
    return vec3.fromValues(Math.cos(a), 0, Math.sin(a));
  });

  const topRing = ring.map(p =>
    vec3.add(
      vec3.create(),
      vec3.scale(vec3.create(), p, spec.begin.width),
      spec.begin.position,
    ),
  );
  const bottomRing = ring.map(p =>
    vec3.add(
      vec3.create(),
      vec3.scale(vec3.create(), p, spec.end.width),
      spec.end.position,
    ),
  );

  // add an extra element for wrap around
  const topRingIndexes: number[] = [
    ...Array.from({ length: segments }).map((_x, i) => i),
    0,
  ];
  const bottomRingIndexes: number[] = [
    ...Array.from({ length: segments }).map((_x, i) => i + segments),
    segments,
  ];

  const quads = Array.from({ length: segments }).map((_x, i) => {
    return [
      bottomRingIndexes[i],
      topRingIndexes[i + 1],
      topRingIndexes[i],

      bottomRingIndexes[i],
      bottomRingIndexes[i + 1],
      topRingIndexes[i + 1],
    ];
  });

  const positions = buildPosition([...topRing, ...bottomRing]);
  const indices = buildIndices(flatten(quads));

  return new Node().mesh(
    new Mesh().addPrimitive(
      new Primitive().indices(indices).position(positions),
    ),
  );
};

const generatorDefinition: GeneratorDefinition<TaggedBranchSpec> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
