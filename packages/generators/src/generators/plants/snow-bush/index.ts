import { mat4, quat, vec3 } from 'gl-matrix';
import { Node, buildTextureFromArrayBuffer } from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../../types';

import { generateStemBlueprints, generateStemModel } from './stems';
import { generateCompoundLeaves, LeafBlueprint } from './compound-leaves';

import getRandomGenerator from '../../util/get-random-generator';
import { prng } from 'seedrandom';
import { flatMap } from 'lodash';
import { KeypointStemAxisBlueprint } from '../../stem-axis/keypoint-stem-axis';
import generateSimpleLeaflet from '../../leaves/keypoint-leaflet/generators/simple-leaflet';
import generateLeafletModel from '../../leaves/keypoint-leaflet/model';
import { generateSnowBushLeafTexture } from './textures/leaf-texture';

const TYPE_LABEL = 'snow-bush';

const SEGMENTS_PER_BRANCH_LENGTH = 2;
const MAIN_BRANCH_LENGTH = 4.5;
const MAIN_BRANCH_WIDTH = 0.06;

const UP_VECTOR = vec3.fromValues(0, 1, 0);

interface SnowBushSpec {
  randomSeed?: string;
}

const generate = (spec: SnowBushSpec): Node => {
  const rng = getRandomGenerator(spec.randomSeed);

  const stems = generateStemBlueprints({ rng });

  const stemModel = generateStemModel({ blueprints: stems });

  const leafBps = generateCompoundLeaves({
    stemBlueprints: stems.map(s => new KeypointStemAxisBlueprint(s.keyPoints)),
    rng,
  });
  // TODO: Replace this with stalk model generator
  const stalkModel = generateStemModel({ blueprints: leafBps.stalkBlueprints });

  const leafModel = generateLeavesModel(leafBps.leafBlueprints, rng);

  return new Node()
    .addChild(stemModel)
    .addChild(stalkModel)
    .addChild(leafModel);
};

const generateLeavesModel = (leafBps: LeafBlueprint[], rng: prng): Node => {
  const leaves = flatMap(leafBps, l => generateLeaf(l, rng));

  const node = new Node();

  for (let leaf of leaves) {
    node.addChild(leaf);
  }

  return node;
};

const generateLeaf = (leafBp: LeafBlueprint, rng: prng): Node => {
  const leafletBp = generateSimpleLeaflet({
    stemLength: 0.1 * leafBp.length,
    stemWidth: 0.05 * leafBp.width,
    leafletLength: leafBp.length,
    leafletWidth: leafBp.width,
    leafletMidpointPosition: 0.4,
  });

  const textureData = generateSnowBushLeafTexture({ size: 16 });
  const { texture: leafTexture } = buildTextureFromArrayBuffer(
    textureData,
    'image/png',
  );
  leafletBp.bladeTexture = leafTexture;

  const leafModel = generateLeafletModel(leafletBp);

  // Orient leaf model along -z axis before pointing in the right direction
  // Lay leaf flat on XZ plane
  const leafRotationMatY = mat4.rotateY(
    mat4.create(),
    mat4.create(),
    Math.PI * 0.5,
  );
  const leafRotationMatZ = mat4.rotateZ(
    mat4.create(),
    mat4.create(),
    Math.PI * 0.5,
  );
  const leafRotationMat = mat4.multiply(
    mat4.create(),
    leafRotationMatZ,
    leafRotationMatY,
  );

  const targetToMat = mat4.targetTo(
    mat4.create(),
    vec3.create(),
    leafBp.direction,
    UP_VECTOR,
  );

  mat4.mul(leafRotationMat, targetToMat, leafRotationMat);

  const leafRotation = mat4.getRotation(quat.create(), leafRotationMat);

  const normalRotation = quat.rotationTo(
    quat.create(),
    UP_VECTOR,
    leafBp.normal,
  );

  quat.mul(leafRotation, normalRotation, leafRotation);

  leafModel
    .translation(leafBp.position[0], leafBp.position[1], leafBp.position[2])
    .rotation(
      leafRotation[0],
      leafRotation[1],
      leafRotation[2],
      leafRotation[3],
    );

  return leafModel;
};

export const snowBushGeneratorComponents = {
  generateSnowBushLeafTexture,
};

export default generate;
