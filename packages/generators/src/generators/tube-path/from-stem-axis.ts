import {
  Node,
  Texture,
  Material,
  MetallicRoughness,
  TextureInfo,
} from "gltf-builder";
import { KeypointStemAxisBlueprint } from "../stem-axis/keypoint-stem-axis/index";

import { generateTubePath as generateTubePathDI } from ".";
import { identity } from "lodash";
import { generateMesh } from "../mesh";

const defaultTexcoordGenerators = {
  vCoordMap: identity,
};

export interface GeneratorProps {
  texture?: Texture;
  texcoordGeneration?: {
    // Maps position [0,1] to texcoord V values [0,1]
    vCoordMap: (number) => number;
  };
  generateTubePath?: typeof generateTubePathDI;
}

export const generateTubePathFromStemAxis = (
  axis: KeypointStemAxisBlueprint,
  options?: GeneratorProps,
): Node => {
  const {
    texture,
    texcoordGeneration = defaultTexcoordGenerators,
    generateTubePath = generateTubePathDI,
  } = options || {};

  const tubePath = generateTubePath({
    segments: axis.keyPoints.map((k, i) => ({
      ...k,
      texV: texcoordGeneration.vCoordMap(axis.getBranchPositionAtSegment(i)),
    })),
  });

  if (texture) {
    const material = new Material().metallicRoughness(
      new MetallicRoughness().baseColorTexture(
        new TextureInfo().texture(texture),
      ),
    );

    tubePath.primitives = tubePath.primitives.map((p) => ({
      ...p,
      material: material,
    }));
  }

  return new Node().mesh(generateMesh(tubePath));
};
