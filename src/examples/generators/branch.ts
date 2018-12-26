import { Asset, Scene } from 'gltf-builder';
import { vec3 } from 'gl-matrix';
import * as fs from 'fs';

import generateBranch from 'generators/branch';

const branch = generateBranch({
  begin: vec3.fromValues(0, 0, 0),
  end: vec3.fromValues(0, 1, 1),
  width: 0.2,
});
const asset = new Asset().addScene(new Scene().addNode(branch));

const gltf = JSON.stringify(asset.build(), null, 2);

fs.mkdirSync('generated', { recursive: true });
fs.writeFileSync('generated/branch.gltf', gltf);
