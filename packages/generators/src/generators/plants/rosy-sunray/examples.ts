import { generateGLTFStory } from '@gengarden/examples';
import { generateRosySunray } from './rosy-sunray';
import { generateLeafModel } from './model/leaf';

const storyArgs = {
  guideBoxSize: ['0.3', '0.3', '0.3'],
  cameraPosition: ['0', '0.2', '0.5'],
};

generateGLTFStory(
  'plants/rosy sunray/seed1',
  generateRosySunray({ randomSeed: 'seed1' }),
  storyArgs,
);

generateGLTFStory(
  'plants/rosy sunray/seed2',
  generateRosySunray({ randomSeed: 'seed2' }),
  storyArgs,
);

generateGLTFStory('plants/rosy sunray/leaf', generateLeafModel({ size: 1 }), {
  showBasePlane: false,
});
