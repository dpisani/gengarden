import { mat4, quat, vec3 } from "gl-matrix";
import { buildTextureFromArrayBuffer, Node } from "gltf-builder";

import { generateCompoundLeaves, LeafBlueprint } from "./compound-leaves.ts";
import { generateStemBlueprints, generateStemModel } from "./stems.ts";

import { prng } from "seedrandom";
import { generateSimpleLeafletBlueprint } from "../../leaves/keypoint-leaflet/generators/simple-leaflet.ts";
import { generateLeafletModel } from "../../leaves/keypoint-leaflet/model.ts";
import { KeypointStemAxisBlueprint } from "../../stem-axis/keypoint-stem-axis/index.ts";
import getRandomGenerator from "../../util/get-random-generator.ts";
import { generateSnowBushLeafTexture } from "./textures/leaf-texture.ts";

const UP_VECTOR = vec3.fromValues(0, 1, 0);

interface SnowBushSpec {
  randomSeed?: string;
}

const generate = async (spec: SnowBushSpec): Promise<Node> => {
  const rng = getRandomGenerator(spec.randomSeed);

  const stems = generateStemBlueprints({ rng });

  const stemModel = await generateStemModel({ blueprints: stems });

  const leafBps = generateCompoundLeaves({
    stemBlueprints: stems.map(
      (s) => new KeypointStemAxisBlueprint(s.keyPoints),
    ),
    rng,
  });
  // TODO: Replace this with stalk model generator
  const stalkModel = await generateStemModel({
    blueprints: leafBps.stalkBlueprints,
  });

  const leafModel = await generateLeavesModel(leafBps.leafBlueprints, rng);

  return new Node()
    .addChild(stemModel)
    .addChild(stalkModel)
    .addChild(leafModel);
};

const generateLeavesModel = async (
  leafBps: LeafBlueprint[],
  rng: prng,
): Promise<Node> => {
  const leaves = await Promise.all(leafBps.map((l) => generateLeaf(l, rng)));

  const node = new Node();

  for (const leaf of leaves) {
    node.addChild(leaf);
  }

  return node;
};

const generateLeaf = async (
  leafBp: LeafBlueprint,
  rng: prng,
): Promise<Node> => {
  const leafletBp = generateSimpleLeafletBlueprint({
    stemLength: 0.1 * leafBp.length,
    stemWidth: 0.05 * leafBp.width,
    leafletLength: leafBp.length,
    leafletWidth: leafBp.width,
    leafletMidpointPosition: 0.4,
  });

  const textureData = await generateSnowBushLeafTexture({ size: 16 });
  const { texture: leafTexture } = buildTextureFromArrayBuffer(
    textureData,
    "image/png",
  );
  leafletBp.bladeTexture = leafTexture;

  const leafModel = generateLeafletModel(leafletBp);

  const targetToMat = mat4.targetTo(
    mat4.create(),
    vec3.create(),
    leafBp.direction,
    UP_VECTOR,
  );

  const leafRotation = mat4.getRotation(quat.create(), targetToMat);

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
