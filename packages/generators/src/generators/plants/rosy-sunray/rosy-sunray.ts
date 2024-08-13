import { Node } from "gltf-builder";
import getRandomGenerator from "../../util/get-random-generator";
import { generateStemAxes } from "./blueprint/stem";
import { generateStemModel } from "./model/stem";

interface RosySunraySpec {
  randomSeed?: string;
}

export const generateRosySunray = ({
  randomSeed: seed,
}: RosySunraySpec): Node => {
  const rng = getRandomGenerator(seed);

  // create stems
  const stemAxes = generateStemAxes(rng);

  const model = new Node();

  for (const axis of stemAxes) {
    model.addChild(generateStemModel({ axis, rng }));
  }

  return model;
};
