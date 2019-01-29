import { Asset, Scene, Node } from 'gltf-builder';
import { cloneDeepWith, isEqual } from 'lodash';

import groupGenerator from '../../generators/group';
import tubeGenerator from '../../generators/tube';
import tubePathGenerator from '../../generators/tube-path';
import meshGenerator from '../../generators/mesh';
import branchGenerator from '../../generators/branch';
import treeGenerator from '../../generators/tree';

import { TaggedSpec, GeneratorDefinition, PartialSpec } from '../../types';

type GeneratedTypes = TaggedSpec | PartialSpec<TaggedSpec> | Node;

const generators: GeneratorDefinition<TaggedSpec, GeneratedTypes>[] = [
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
  spec: TaggedSpec,
): ((ts: TaggedSpec) => GeneratedTypes) | undefined => {
  const foundGenerator = generators.find(({ isValidSpec }) =>
    isValidSpec(spec),
  );
  if (foundGenerator) {
    return foundGenerator.generate;
  }

  return undefined;
};

const realiseComponent = (
  spec: TaggedSpec | PartialSpec<TaggedSpec>,
): GeneratedTypes => {
  if (typeof spec.type !== 'string') {
    throw new Error('spec type must always be a string');
  }

  const realisedSpec: TaggedSpec = {
    type: spec.type,
    spec: cloneDeepWith(spec.spec, prop => {
      if (prop instanceof Object && prop.type && prop.spec) {
        return realiseComponent(prop);
      }
    }),
  };

  const generator = findGenerator(realisedSpec);

  if (generator) {
    return generator(realisedSpec);
  } else {
    return realisedSpec;
  }
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

  //keep transforming the spec until a gltf node comes out
  let transformedSpec: GeneratedTypes = spec;
  while (!(transformedSpec instanceof Node)) {
    const result = realiseComponent(transformedSpec);

    if (isEqual(result, transformedSpec)) {
      throw new Error('Spec cannot be realised');
    }

    transformedSpec = result;
  }

  asset.addScene(new Scene().addNode(transformedSpec));

  return asset;
};
