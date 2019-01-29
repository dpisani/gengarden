import { vec3, mat4 } from 'gl-matrix';
import { prng } from 'seedrandom';
import { flatMap } from 'lodash';

import { TaggedSpec, GeneratorDefinition, PartialSpec } from '../../types';

import { TaggedGroupSpec } from '../group';
import { TaggedBranchSpec } from '../branch';

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
): TaggedBranchSpec[] => {
  const points = [{ position: vec3.clone(startPos), width: startWidth }];

  // the points at which a new branch should stem from
  const forks: {
    startPos: vec3;
    direction: vec3;
    maxDepth: number;
    startWidth: number;
  }[] = [];

  const currentPos = vec3.clone(startPos);

  let generatedPoints = 0;
  do {
    vec3.add(currentPos, currentPos, startDir);
    generatedPoints++;

    if (rng() < 0.2) {
      const currentWidth = (1 - generatedPoints / maxDepth) * startWidth;

      // fork
      const r = 0.1;
      const rotation = mat4.fromXRotation(mat4.create(), r);
      if (maxDepth - generatedPoints > 0) {
        forks.push({
          startPos: vec3.clone(currentPos),
          direction: vec3.transformMat4(vec3.create(), startDir, rotation),
          maxDepth: maxDepth - generatedPoints,
          startWidth: currentWidth,
        });
      }

      points.push({
        position: vec3.clone(currentPos),
        width: currentWidth,
      });
    }
  } while (generatedPoints < maxDepth && rng() > 0.01);

  points.push({ position: vec3.clone(currentPos), width: 0 });

  const trunk: TaggedBranchSpec = {
    type: 'branch',
    spec: {
      keyPoints: points,
    },
  };

  const childBranches = flatMap(forks, fork =>
    generateBranches(
      fork.startPos,
      fork.direction,
      fork.maxDepth,
      fork.startWidth,
      rng,
    ),
  );

  const branches: TaggedBranchSpec[] = [trunk, ...childBranches];

  return branches;
};

const generate = (spec: TreeSpec): PartialSpec<TaggedGroupSpec> => {
  const rng = getRandomGenerator(spec.randomSeed);

  return {
    type: 'group',
    spec: {
      items: generateBranches(
        vec3.create(),
        vec3.fromValues(0, 1, 0),
        10,
        1,
        rng,
      ),
    },
  };
};

const generatorDefinition: GeneratorDefinition<
  TreeSpec,
  PartialSpec<TaggedGroupSpec>
> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
