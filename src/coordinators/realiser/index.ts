import { Asset, Scene } from 'gltf-builder';
import { cloneDeepWith } from 'lodash';

import groupGenerator from '../../generators/group';
import branchGenerator from '../../generators/branch';

interface Spec {
  type: string;
  spec: object;
}

const findGenerator = (spec: Spec): ((any) => any) => {
  switch (spec.type) {
    case 'group':
      return groupGenerator;
    case 'branch':
      return branchGenerator;
    default:
      throw new Error(`no generator found for type: ${spec.type}`);
  }
};

const realiseComponent = (spec: Spec): any => {
  const generator = findGenerator(spec);

  const realisedSpec = cloneDeepWith(spec.spec, prop => {
    if (prop instanceof Object && prop.type && prop.spec) {
      return realiseComponent(prop);
    }
  });

  console.log(realisedSpec);
  return generator(realisedSpec);
};

/**
 * realiseSpec - Turns a spec into a real 3D asset
 *
 * @param {Spec} spec Specification of the asset
 *
 * @returns {Asset} a gltf-builder Asset
 */
export default (spec: Spec): Asset => {
  const asset = new Asset();

  asset.addScene(new Scene().addNode(realiseComponent(spec)));

  return asset;
};
