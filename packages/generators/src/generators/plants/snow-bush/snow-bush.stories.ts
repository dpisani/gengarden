import { Meta, StoryObj } from "@storybook/html";
import {
  GLTFStoryArgs,
  defaultGLTFStoryMeta,
  renderGltfStory,
} from "../../../storybook/render-gltf-story.ts";
import generateSnowBush from "./index.ts";

const meta: Meta<GLTFStoryArgs & { randomSeed: string }> = {
  ...defaultGLTFStoryMeta,
  render: ({ randomSeed, ...args }) =>
    renderGltfStory(generateSnowBush({ randomSeed }))(args),
};

export default meta;

export const SnowBush: StoryObj<GLTFStoryArgs & { randomSeed: string }> = {
  args: {
    cameraPosition: [0, 1.2, 3],
    randomSeed: "seed1",
  },
};
