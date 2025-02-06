import { vec3 } from "gl-matrix";

import { vec2 } from "gl-matrix";
import { PrimitiveBlueprint } from "../mesh/index.ts";
import createRing from "../util/create-ring.ts";
import { sampleInterval } from "../util/math.ts";

type RingSpec = vec3[];

interface UVSpec {
  endV: number;
  beginV: number;
}

interface TubeSpecPoints {
  begin: { position: vec3; width: number };
  end: { position: vec3; width: number };
  numSides?: number;
  texInfo?: UVSpec;
}

interface TubeSpecRings {
  begin: RingSpec;
  end: RingSpec;
  texInfo?: UVSpec;
}

export const generateTubeSpecFromPoints = (
  spec: TubeSpecPoints,
): TubeSpecRings => {
  const ring = createRing({ numPoints: spec.numSides });

  const beginRing = ring.map((p, i) => {
    return vec3.add(
      vec3.create(),
      vec3.scale(vec3.create(), p, spec.begin.width),
      spec.begin.position,
    );
  });

  const endRing = ring.map((p, i) => {
    return vec3.add(
      vec3.create(),
      vec3.scale(vec3.create(), p, spec.end.width),
      spec.end.position,
    );
  });

  return { begin: beginRing, end: endRing, texInfo: spec.texInfo };
};

export const generateTube = (spec: TubeSpecRings): PrimitiveBlueprint => {
  if (spec.begin.length !== spec.end.length) {
    throw new Error("begin and end must have the same number of points");
  }

  const segments = spec.begin.length;

  const uCoords = sampleInterval(0, 1, segments);

  const beginRing = spec.begin.map((p, i) => {
    if (spec.texInfo) {
      const texcoord = vec2.fromValues(uCoords[i], spec.texInfo.beginV);
      return { position: p, texcoord };
    }

    return { position: p };
  });
  const endRing = spec.end.map((p, i) => {
    if (spec.texInfo) {
      const texcoord = vec2.fromValues(uCoords[i], spec.texInfo.endV);
      return { position: p, texcoord };
    }

    return { position: p };
  });

  // add an extra element for wrap around
  const topRingIndexes: number[] = [
    ...Array.from({ length: segments }).map((x, i) => i),
    0,
  ];
  const bottomRingIndexes: number[] = [
    ...Array.from({ length: segments }).map((x, i) => i + segments),
    segments,
  ];

  const polygons: [number, number, number][] = Array.from({ length: segments })
    .map((x, i): [number, number, number][] => {
      return [
        [bottomRingIndexes[i], topRingIndexes[i + 1], topRingIndexes[i]],
        [bottomRingIndexes[i], bottomRingIndexes[i + 1], topRingIndexes[i + 1]],
      ];
    })
    .flat();

  return {
    polygons,
    vertices: [...beginRing, ...endRing],
  };
};
