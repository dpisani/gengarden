import { StoryObj } from '@storybook/html';
import generateSnowBush from './index';
import {
  GLTFStoryArgs,
  defaultGLTFStoryMeta,
  renderGltfStory,
} from '../../util/storybook/render-gltf-story';

export default { ...defaultGLTFStoryMeta };

export const SnowBush: StoryObj<GLTFStoryArgs> = {
  render: renderGltfStory(generateSnowBush({ randomSeed: 'seed1' })),
};
