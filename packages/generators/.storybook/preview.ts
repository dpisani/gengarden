import type { Preview } from '@storybook/html';
import "aframe";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  // decorators: [(arg) => {}]
};

export default preview;
