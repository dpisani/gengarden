import { vec3, quat } from 'gl-matrix';
import { prng } from 'seedrandom';
import { flatMap } from 'lodash';
import { Node } from 'gltf-builder';

import { TaggedSpec, GeneratorDefinition } from '../../types';

import groupGenerator from '../group';
import branchGenerator from '../branch';

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

const createDeviation = (
  originalDirection: vec3,
  minAngle: number,
  maxAngle: number,
  rng: prng,
): vec3 => {
  const chosenAngle = (maxAngle - minAngle) * rng() + minAngle;

  // create a vector deviating from the Y axis and then rotate it towards the original direction
  const deviated = vec3.fromValues(
    Math.sin(chosenAngle),
    Math.cos(chosenAngle),
    0,
  );

  const qRotateY = quat.create();
  quat.rotateY(qRotateY, qRotateY, Math.PI * 2 * rng());

  const qToOriginal = quat.rotationTo(
    quat.create(),
    vec3.fromValues(0, 1, 0),
    originalDirection,
  );

  vec3.transformQuat(deviated, deviated, qRotateY);
  vec3.transformQuat(deviated, deviated, qToOriginal);

  return deviated;
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
  const forks: {
    startPos: vec3;
    direction: vec3;
    maxDepth: number;
    startWidth: number;
  }[] = [];

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
          startPos: vec3.clone(currentPos),
          direction: createDeviation(
            currentDir,
            Math.PI * 0.05,
            Math.PI * 0.25,
            rng,
          ),
          maxDepth: maxDepth - generatedPoints,
          startWidth: currentWidth * 0.8,
        });
      }

      points.push({
        position: vec3.clone(currentPos),
        width: currentWidth,
      });

      //wiggle the direction of the main branch
      vec3.copy(
        currentDir,
        createDeviation(currentDir, 0, Math.PI * 0.25, rng),
      );
    }
  } while (generatedPoints < maxDepth && rng() > 0.01);

  points.push({ position: vec3.clone(currentPos), width: 0 });

  const trunk: Node = branchGenerator.generate({
    keyPoints: points,
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

  return groupGenerator.generate({
    items: generateBranches(
      vec3.create(),
      vec3.fromValues(0, 1, 0),
      10,
      1,
      rng,
    ),
  });
};

const generatorDefinition: GeneratorDefinition<TreeSpec, Node> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
