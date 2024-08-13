import { generateSnowBushLeafTexture } from "./leaf-texture";
import { renderTextureStory } from "../../../util/storybook/render-texture-story";

export default {};

export const LeafTexture = {
  render: renderTextureStory(
    ...Array.from({ length: 4 }).map((_, i) => {
      const size = Math.pow(2, i + 4);
      return generateSnowBushLeafTexture({ size });
    }),
  ),
};
