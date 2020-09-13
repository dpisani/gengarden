import path from 'path';
import fs from 'fs-extra';
import slugify from '@sindresorhus/slugify';

const TARGET_DIR = process.env.STORY_TARGET_DIR ?? process.cwd();

const storyTemplate = (imgPaths: string[], title: string) => `// Autogenerated
import { textureStoryTemplate } from '@gengarden/examples/build/lib/story-template';
${imgPaths.map((p, i) => `import image${i} from './${p}'`).join('\n')}

const images = [
  ${imgPaths.map((p, i) => `image${i}`).join(',\n')}
];

export default {
  title: '${title}',
};

export const Texture = textureStoryTemplate({ imageUrls: images });
`

export const generateTextureStory = async (
  title: string,
  ...pngBuffers: Buffer[]
) => {
  const imageFileNames: string[] = []

  for (const i in pngBuffers) {
    const fName = `${slugify(`${title}-${i}`)}.png`;
    const assetPath = path.resolve(TARGET_DIR, fName)

    await fs.outputFile(assetPath, pngBuffers[i]).catch(e =>
      console.error(e),
    );

    imageFileNames.push(fName)
  }

  const slug = slugify(title)

  const storyPath = path.resolve(TARGET_DIR, `${slug}.stories.js`)
  await fs.outputFile(storyPath, storyTemplate(imageFileNames, title))
};
