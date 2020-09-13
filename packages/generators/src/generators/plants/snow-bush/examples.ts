import { generateGLTFStory } from '@gengarden/examples';
import generateSnowBush from './index';

generateGLTFStory(
  'plants/snow bush/seed1',
  generateSnowBush({ randomSeed: 'seed1' }),
);

generateGLTFStory(
  'plants/snow bush/seed2',
  generateSnowBush({ randomSeed: 'seed2' }),
);
