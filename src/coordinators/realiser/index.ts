import { Asset, Scene, Node } from 'gltf-builder';
import { cloneDeepWith } from 'lodash';

import groupGenerator from '../../generators/group';
import tubeGenerator from '../../generators/tube';
import tubePathGenerator from '../../generators/tube-path';
import meshGenerator from '../../generators/mesh';
import branchGenerator from '../../generators/branch';
import treeGenerator from '../../generators/tree';

import { TaggedSpec, GeneratorDefinition } from '../../types';

type GeneratedTypes = Node;

const generators: GeneratorDefinition<any, GeneratedTypes>[] = [
  treeGenerator,
  branchGenerator,
  // primitive generators
  tubeGenerator,
  tubePathGenerator,
  // gltf object generators
  meshGenerator,
  groupGenerator,
];

const findGenerator = (
  spec: TaggedSpec<any>,
): ((ts: any) => GeneratedTypes) | undefined => {
  const foundGenerator = generators.find(({ isValidSpec }) =>
    isValidSpec(spec),
  );
  if (foundGenerator) {
    return foundGenerator.generate;
  }

  return undefined;
};

const realiseComponent = (spec: TaggedSpec<any>): GeneratedTypes => {
  if (typeof spec.type !== 'string') {
    throw new Error('spec type must always be a string');
  }

  const realisedSpec: TaggedSpec<any> = {
    type: spec.type,
    spec: cloneDeepWith(spec.spec, prop => {
      if (prop instanceof Object && prop.type && prop.spec) {
        return realiseComponent(prop);
      }
    }),
  };

  const generator = findGenerator(realisedSpec);

  if (generator) {
    return generator(realisedSpec.spec);
  } else {
    throw new Error(`missing generator for type ${spec.type}`);
  }
};

/**
 * realiseSpec - Turns a spec into a real 3D asset
 *
 * @param {Spec} spec Specification of the asset
 *
 * @returns {Asset} a gltf-builder Asset
 */
export default (spec: TaggedSpec<any>): Asset => {
  const asset = new Asset();

  const transformedSpec = realiseComponent(spec);

  if (!(transformedSpec instanceof Node)) {
    throw new Error('Could not transform spec');
  }

  asset.addScene(new Scene().addNode(transformedSpec));

  return asset;
};
