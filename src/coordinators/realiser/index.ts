import { Asset, Mesh, Node, Scene } from 'gltf-builder';
import { cloneDeepWith } from 'lodash';

import { groupGeneratorDefinition } from '../../generators/group';
import { leafGeneratorDefinition } from '../../generators/leaf';
import meshGenerator from '../../generators/mesh';
import { plantGeneratorDefinition } from '../../generators/plant';
import { treeGeneratorDefinition } from '../../generators/tree';
import tubeGenerator from '../../generators/tube';
import { tubePathGeneratorDefinition } from '../../generators/tube-path';

import { GeneratorDefinition, TaggedSpec } from '../../types';

type GeneratedTypes = Node | Mesh;

const generators: Array<GeneratorDefinition<any, GeneratedTypes>> = [
  treeGeneratorDefinition,
  leafGeneratorDefinition,
  plantGeneratorDefinition,
  // primitive generators
  tubeGenerator,
  tubePathGeneratorDefinition,
  // gltf object generators
  meshGenerator,
  groupGeneratorDefinition,
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
    spec: cloneDeepWith(spec.spec, prop => {
      if (prop instanceof Object && prop.type && prop.spec) {
        return realiseComponent(prop);
      }
    }),
    type: spec.type,
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
