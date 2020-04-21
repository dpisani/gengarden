import { vec3 } from 'gl-matrix';
import { Node } from 'gltf-builder';
import { flatMap } from 'lodash';
import { prng } from 'seedrandom';

import { GeneratorDefinition, TaggedSpec } from '../../types';

import groupGenerator from '../group';
import generateTubePath from '../tube-path';

import createDeviation from '../util/create-devitaion';
import getRandomGenerator from '../util/get-random-generator';

interface TreeSpec {
  randomSeed?: string;
}

interface TaggedTreeSpec extends TaggedSpec<TreeSpec> {
  type: 'tree';
}

const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedTreeSpec => {
  const { type } = taggedSpec;

  return type === 'tree';
};

const generateBranches = (
  startPos: vec3,
  startDir: vec3,
  maxDepth: number,
  startWidth: number,
  rng: prng,
): Node[] => {
  const points = [{ position: vec3.clone(startPos), width: startWidth }];

  // the points at which a new branch should stem from
  const forks: Array<{
    startPos: vec3;
    direction: vec3;
    maxDepth: number;
    startWidth: number;
  }> = [];

  const currentPos = vec3.clone(startPos);
  const currentDir = vec3.clone(startDir);

  let generatedPoints = 0;
  do {
    vec3.add(currentPos, currentPos, currentDir);
    generatedPoints++;

    if (rng() < 0.05 * maxDepth) {
      const currentWidth = (1 - generatedPoints / maxDepth) * startWidth;

      // fork

      if (maxDepth - generatedPoints > 0) {
        forks.push({
          direction: createDeviation(
            currentDir,
            Math.PI * 0.05,
            Math.PI * 0.25,
            rng,
          ),
          maxDepth: maxDepth - generatedPoints,
          startPos: vec3.clone(currentPos),
          startWidth: currentWidth * 0.8,
        });
      }

      points.push({
        position: vec3.clone(currentPos),
        width: currentWidth,
      });

      // wiggle the direction of the main branch
      vec3.copy(
        currentDir,
        createDeviation(currentDir, 0, Math.PI * 0.25, rng),
      );
    }
  } while (generatedPoints < maxDepth && rng() > 0.01);

  points.push({ position: vec3.clone(currentPos), width: 0 });

  const trunk: Node = generateTubePath({
    segments: points,
  });

  const childBranches = flatMap(forks, fork =>
    generateBranches(
      fork.startPos,
      fork.direction,
      fork.maxDepth,
      fork.startWidth,
      rng,
    ),
  );

  const branches: Node[] = [trunk, ...childBranches];

  return branches;
};

const generate = (spec: TreeSpec): Node => {
  const rng = getRandomGenerator(spec.randomSeed);

  return groupGenerator({
    items: generateBranches(
      vec3.create(),
      vec3.fromValues(0, 1, 0),
      10,
      1,
      rng,
    ),
  });
};

export const treeGeneratorDefinition: GeneratorDefinition<TreeSpec, Node> = {
  generate,
  isValidSpec,
};

export default generate;
