import realiseSpec from '../coordinators/realiser';

import * as fs from 'fs';

const [, , inputPath, outPath] = process.argv;

if (!inputPath) {
  console.log('Spec file must be specified');
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const gltf = JSON.stringify(realiseSpec(spec).build(), null, 2);

fs.writeFileSync(outPath || 'realised-spec.gltf', gltf);
