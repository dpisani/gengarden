import { vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';
import { flatten } from 'lodash';

import { GeneratorDefinition, TaggedSpec } from '../../types';
import { generateMesh, PrimitiveBlueprint } from '../mesh';
import createRing from '../util/create-ring';
import { vec2 } from 'gl-matrix';
import { sampleInterval } from '../util/math';

type RingSpec = vec3[];

interface UVSpec {
  endV: number;
  beginV: number;
}

interface TubeSpecPoints {
  begin: { position: vec3; width: number };
  end: { position: vec3; width: number };
  texInfo?: UVSpec;
}

interface TubeSpecRings {
  begin: RingSpec;
  end: RingSpec;
  texInfo?: UVSpec;
}

export type TubeSpec = TubeSpecPoints | TubeSpecRings;

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

export const generateTube = (spec: TubeSpec): PrimitiveBlueprint => {
  let segments: number;
  let beginRing: { position: vec3; texcoord?: vec2 }[];
  let endRing: { position: vec3; texcoord?: vec2 }[];

  if (isTubeSpecPoints(spec)) {
    const ring = createRing();
    segments = ring.length;

    const uCoords = sampleInterval(0, 1, segments);

    beginRing = ring.map((p, i) => {
      const position = vec3.add(
        vec3.create(),
        vec3.scale(vec3.create(), p, spec.begin.width),
        spec.begin.position,
      );

      if (spec.texInfo) {
        const texcoord = vec2.fromValues(uCoords[i], spec.texInfo.beginV);
        return { position, texcoord };
      }

      return { position };
    });

    endRing = ring.map((p, i) => {
      const position = vec3.add(
        vec3.create(),
        vec3.scale(vec3.create(), p, spec.end.width),
        spec.end.position,
      );

      if (spec.texInfo) {
        const texcoord = vec2.fromValues(uCoords[i], spec.texInfo.endV);
        return { position, texcoord };
      }

      return { position };
    });
  } else {
    if (spec.begin.length !== spec.end.length) {
      throw new Error('begin and end must have the same number of points');
    }

    segments = spec.begin.length;

    const uCoords = sampleInterval(0, 1, segments);

    beginRing = spec.begin.map((p, i) => {
      if (spec.texInfo) {
        const texcoord = vec2.fromValues(uCoords[i], spec.texInfo.beginV);
        return { position: p, texcoord };
      }

      return { position: p };
    });
    endRing = spec.end.map((p, i) => {
      if (spec.texInfo) {
        const texcoord = vec2.fromValues(uCoords[i], spec.texInfo.endV);
        return { position: p, texcoord };
      }

      return { position: p };
    });
  }

  // add an extra element for wrap around
  const topRingIndexes: number[] = [
    ...Array.from({ length: segments }).map((x, i) => i),
    0,
  ];
  const bottomRingIndexes: number[] = [
    ...Array.from({ length: segments }).map((x, i) => i + segments),
    segments,
  ];

  const polygons: [number, number, number][] = flatten(
    Array.from({ length: segments }).map((x, i) => {
      return [
        [bottomRingIndexes[i], topRingIndexes[i + 1], topRingIndexes[i]],
        [bottomRingIndexes[i], bottomRingIndexes[i + 1], topRingIndexes[i + 1]],
      ];
    }),
  );

  return {
    polygons,
    vertices: [...beginRing, ...endRing],
  };
};
