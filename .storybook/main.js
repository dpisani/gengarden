import { dirname, join } from "path";
module.exports = {
  stories: ['../packages/*/build/stories/*.stories.js'],
  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-essentials")],

  framework: {
    name: getAbsolutePath("@storybook/html-webpack5"),
    options: {}
  },

  docs: {
    autodocs: false
  },

  async webpackFinal(config) {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.gltf/,
            type: 'asset/resource'
          }
        ]
      }
    }
  }
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
