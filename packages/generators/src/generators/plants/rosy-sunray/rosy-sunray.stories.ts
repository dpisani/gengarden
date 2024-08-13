import { generateRosySunray } from "./rosy-sunray";
import { generateLeafModel } from "./model/leaf";
import {
  defaultGLTFStoryArgs,
  defaultGLTFStoryMeta,
  renderGltfStory,
} from "../../util/storybook/render-gltf-story";

export default {
  ...defaultGLTFStoryMeta,
  args: {
    ...defaultGLTFStoryArgs,
    guideBoxSize: ["0.3", "0.3", "0.3"],
    cameraPosition: ["0", "0.2", "0.5"],
  },
};

export const Seed1 = {
  render: renderGltfStory(generateRosySunray({ randomSeed: "seed1" })),
};

export const Seed2 = {
  render: renderGltfStory(generateRosySunray({ randomSeed: "seed2" })),
};

export const Leaf = {
  render: renderGltfStory(generateLeafModel({ size: 1 })),
  args: {
    showBasePlane: false,
    cameraPosition: ["0", "-1.5", "0.5"],
  },
};
