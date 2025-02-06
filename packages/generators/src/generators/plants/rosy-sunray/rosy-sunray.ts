import { Node } from "gltf-builder";
import getRandomGenerator from "../../util/get-random-generator.ts";
import { generateStemAxes } from "./blueprint/stem.ts";
import { generateStemModel } from "./model/stem.ts";

export interface RosySunraySpec {
  randomSeed?: string;
  mainStems?: number;
  growthFactor?: number;
}

export const generateRosySunray = ({
  randomSeed: seed,
  mainStems,
  growthFactor,
}: RosySunraySpec): Node => {
  const rng = getRandomGenerator(seed);

  // create stems
  const stemAxes = generateStemAxes({
    rng,
    mainStems,
    growthFactor,
  });

  const model = new Node();

  for (const axis of stemAxes) {
    model.addChild(generateStemModel({ axis, rng }));
  }

  return model;
};
