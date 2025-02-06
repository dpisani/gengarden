import { Meta, StoryObj } from "@storybook/html";
import {
  GLTFStoryArgs,
  defaultGLTFStoryArgs,
  defaultGLTFStoryMeta,
  renderGltfStory,
} from "../../../storybook/render-gltf-story.ts";
import getRandomGenerator from "../../util/get-random-generator.ts";
import { generateFlowerModel } from "./model/flower.ts";
import { generateLeafModel } from "./model/leaf.ts";
import { RosySunraySpec, generateRosySunray } from "./rosy-sunray.ts";

const meta: Meta<GLTFStoryArgs<RosySunraySpec>> = {
  ...defaultGLTFStoryMeta,
  args: {
    ...defaultGLTFStoryArgs,
  },
  render: ({ randomSeed, mainStems, growthFactor, ...args }) =>
    renderGltfStory(
      generateRosySunray({ randomSeed, mainStems, growthFactor }),
    )(args),
};

export default meta;

export const RosySunray = {
  args: {
    cameraPosition: [0, 0.1, 0.03],
    randomSeed: "seed",
    mainStems: 6,
    growthFactor: 0.003,
  },
};

export const Leaf = {
  render: renderGltfStory(generateLeafModel({ size: 1 })),
  args: {
    showBasePlane: false,
    cameraPosition: [0, 1.5, 0.5],
  },
};

export const Flower: StoryObj<
  GLTFStoryArgs & { randomSeed: string; petals: number; spiralLevel: number }
> = {
  render: ({ randomSeed, petals, spiralLevel, ...args }) =>
    renderGltfStory(
      generateFlowerModel({
        size: 1,
        rng: getRandomGenerator(randomSeed),
        petals,
        spiralLevel,
      }),
    )(args),
  args: {
    showBasePlane: false,
    cameraPosition: [0, 1.5, 0.5],
    spiralLevel: 8,
    petals: 35,
  },
};
