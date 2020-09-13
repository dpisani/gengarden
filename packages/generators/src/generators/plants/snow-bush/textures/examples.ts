import { generateTextureStory } from '@gengarden/examples';
import { generateSnowBushLeafTexture } from './leaf-texture';

generateTextureStory(
  'plants/snow bush/leaf texture',
  ...Array.from({ length: 4 }).map((_, i) => {
    const size = Math.pow(2, i + 4);
    return generateSnowBushLeafTexture({ size });
  }),
);
