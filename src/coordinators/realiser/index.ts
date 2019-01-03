import { Asset, Scene } from 'gltf-builder';
import { cloneDeepWith } from 'lodash';

import groupGenerator from '../../generators/group';
import branchGenerator from '../../generators/branch';

import { TaggedSpec, GeneratorDefinition } from '../../types';

const generators: GeneratorDefinition<any>[] = [
  branchGenerator,
  groupGenerator,
];

const findGenerator = (spec: TaggedSpec): ((TaggedSpec) => any) => {
  const foundGenerator = generators.find(({ isValidSpec }) =>
    isValidSpec(spec),
  );
  if (foundGenerator) {
    return foundGenerator.generate;
  }

  throw new Error(`no generator found for type: ${spec.type}`);
};

const realiseComponent = (spec: TaggedSpec): any => {
  const realisedSpec: TaggedSpec = {
    type: spec.type,
    spec: cloneDeepWith(spec.spec, prop => {
      if (prop instanceof Object && prop.type && prop.spec) {
        return realiseComponent(prop);
      }
    }),
  };

  const generator = findGenerator(realisedSpec);
  return generator(realisedSpec);
};

/**
 * realiseSpec - Turns a spec into a real 3D asset
 *
 * @param {Spec} spec Specification of the asset
 *
 * @returns {Asset} a gltf-builder Asset
 */
export default (spec: TaggedSpec): Asset => {
  const asset = new Asset();

  asset.addScene(new Scene().addNode(realiseComponent(spec)));

  return asset;
};
