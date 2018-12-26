import {
  Node,
  Mesh,
  Primitive,
  buildIndices,
  buildPosition,
} from 'gltf-builder';
import { vec3 } from 'gl-matrix';
import { flatten } from 'lodash';

interface BranchSpec {
  begin: vec3;
  end: vec3;
  width: number;
}

export default (spec: BranchSpec): Node => {
  const segments = 10;
  const segmentAngle = (Math.PI * 2) / segments;
  const ring: vec3[] = Array.from({ length: segments }).map((_x, i) => {
    const a = segmentAngle * i;
    return vec3.fromValues(Math.cos(a), 0, Math.sin(a));
  });

  const topRing = ring.map(p =>
    vec3.add(
      vec3.create(),
      vec3.scale(vec3.create(), p, spec.width),
      spec.begin,
    ),
  );
  const bottomRing = ring.map(p =>
    vec3.add(vec3.create(), vec3.scale(vec3.create(), p, spec.width), spec.end),
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
