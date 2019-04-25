import { vec3 } from 'gl-matrix';
import { Material, Node } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../types';
import getRandomGenerator from '../util/get-random-generator';

import { flatten } from 'lodash';
import { prng } from 'seedrandom';
import groupGenerator from '../group';
import meshGenerator from '../mesh';
import tubePathGenerator from '../tube-path';

interface LeafSpec {
  randomSeed?: string;
  length: number;
  width: number;
}

interface TaggedLeafSpec extends TaggedSpec<LeafSpec> {
  type: 'leaf';
}

const isValidSpec = (spec: TaggedSpec<any>): spec is TaggedLeafSpec =>
  spec.type === 'leaf';

const twoSidedMaterial = new Material().doubleSided(true);

const generateBlade = (width: number, height: number, rng: prng): Node => {
  const segments = 10;

  const b1 = vec3.fromValues(0, 0, 0);
  const b2 = vec3.fromValues(1 + rng() * 0.5, 0.3, 0);
  const b3 = vec3.fromValues(1 - rng() * 0.5, 0.8, 0);
  const b4 = vec3.fromValues(0, 1, 0);

  // generate vertices and indices for segments that are not the ends
  const middlePoints = Array.from({ length: segments - 1 })
    .map((x, i) => i + 1)
    .map(i => {
      const t = i / segments;
      const bezPoint = vec3.bezier(vec3.create(), b1, b2, b3, b4, t);

      const stem = vec3.fromValues(0, t * height, 0);

      const edge = vec3.mul(
        bezPoint,
        bezPoint,
        vec3.fromValues(width, t * height, 0),
      );

      return { vertices: [stem, edge], indices: [i * 2, i * 2 + 1] };
    });

  const middleSegments = Array.from({ length: segments - 2 }).map((x, i) => {
    const bottom = middlePoints[i].indices;
    const top = middlePoints[i + 1].indices;
    return [bottom[0], bottom[1], top[1], top[1], top[0], bottom[0]];
  });

  const bottomPoint = vec3.fromValues(0, 0, 0);
  const bottomIndex = 0;

  const topPoint = vec3.fromValues(0, height, 0);
  const topIndex = 1;

  const bottomSegment = [
    bottomIndex,
    middlePoints[0].indices[1],
    middlePoints[0].indices[0],
  ];

  const topSegment = [
    middlePoints[segments - 2].indices[0],
    middlePoints[segments - 2].indices[1],
    topIndex,
  ];

  const vertices = flatten([
    [bottomPoint, topPoint],
    ...middlePoints.map(mp => mp.vertices),
  ]);

  const indices = flatten([bottomSegment, ...middleSegments, topSegment]);

  const halfMesh = meshGenerator.generate({
    geometry: {
      indices,
      vertices,
    },
    material: twoSidedMaterial,
  });

  const rightHalf = new Node().mesh(halfMesh);

  const leftHalf = new Node().mesh(halfMesh).scale(-1, 1, 1);

  return new Node().addChild(leftHalf).addChild(rightHalf);
};

const generate = (spec: LeafSpec) => {
  const rng = getRandomGenerator(spec.randomSeed);

  const { width, length } = spec;

  const stem = tubePathGenerator({
    segments: [
      { position: vec3.fromValues(0, 0, 0), width: 0.01 },
      { position: vec3.fromValues(0, length, 0), width: 0 },
    ],
  });

  // the length before the blade starts
  const baseLength = length * 0.1;

  const blade = generateBlade(width, length - baseLength, rng).translation(
    0,
    baseLength,
    0,
  );

  return groupGenerator({ items: [stem, blade] });
};

export const leafGeneratorDefinition: GeneratorDefinition<LeafSpec, Node> = {
  generate,
  isValidSpec,
};

export default generate;
