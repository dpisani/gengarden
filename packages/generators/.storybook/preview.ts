import type { Preview } from "@storybook/html";
import "aframe";
import "aframe-orbit-controls";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
