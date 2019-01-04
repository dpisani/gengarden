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
import createRing from '../../util/create-ring';

type RingSpec = vec3[];

interface TubeSpecPoints {
  begin: { position: vec3; width: number };
  end: { position: vec3; width: number };
}

interface TubeSpecRings {
  begin: RingSpec;
  end: RingSpec;
}

export interface TaggedTubeSpec extends TaggedSpec {
  type: 'tube';
  spec: TubeSpecPoints | TubeSpecRings;
}

function isTubeSpecPoints(spec): spec is TubeSpecPoints {
  return (
    spec.begin &&
    spec.begin.position &&
    spec.begin.width &&
    spec.end &&
    spec.end.position &&
    spec.end.width
  );
}

function isTubeSpecRings(spec): spec is TubeSpecRings {
  return (
    spec.begin &&
    Array.isArray(spec.begin) &&
    spec.end &&
    Array.isArray(spec.end) &&
    spec.end.length === spec.begin.length
  );
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
): taggedSpec is TaggedTubeSpec => {
  const { type, spec } = taggedSpec;
  if (type === 'tube' && (isTubeSpecPoints(spec) || isTubeSpecRings(spec))) {
    return true;
  }

  return false;
};

export const generate = ({ spec }: TaggedTubeSpec): Node => {
  let segments: number, topRing: vec3[], bottomRing: vec3[];

  if (isTubeSpecPoints(spec)) {
    const ring = createRing();
    segments = ring.length;

    topRing = ring.map(p =>
      vec3.add(
        vec3.create(),
        vec3.scale(vec3.create(), p, spec.begin.width),
        spec.begin.position,
      ),
    );
    bottomRing = ring.map(p =>
      vec3.add(
        vec3.create(),
        vec3.scale(vec3.create(), p, spec.end.width),
        spec.end.position,
      ),
    );
  } else {
    segments = spec.begin.length;
    topRing = spec.begin;
    bottomRing = spec.end;
  }

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

const generatorDefinition: GeneratorDefinition<TaggedTubeSpec, Node> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
