import {
  Material,
  MetallicRoughness,
  Texture,
  TextureInfo,
} from "gltf-builder";
import { KeypointStemAxisBlueprint } from "../stem-axis/keypoint-stem-axis/index.ts";

import { identity } from "lodash-es";
import { MeshBlueprint } from "../mesh/index.ts";
import {
  TubePathSpec,
  generateTubePath as generateTubePathDI,
} from "./index.ts";

const defaultTexcoordGenerators = {
  vCoordMap: identity,
};

export type GeneratorProps = {
  texture?: Texture;
  texcoordGeneration?: {
    // Maps position [0,1] to texcoord V values [0,1]
    vCoordMap: (number) => number;
  };
  generateTubePath?: typeof generateTubePathDI;
} & Pick<TubePathSpec, "generateEndCap" | "generateStartCap" | "numSides">;

export const generateTubePathFromStemAxis = (
  axis: KeypointStemAxisBlueprint,
  options?: GeneratorProps,
): MeshBlueprint => {
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
    generateEndCap: options?.generateEndCap,
    generateStartCap: options?.generateStartCap,
    numSides: options?.numSides,
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

  return tubePath;
};
