import realiseSpec from '../coordinators/realiser';

import * as fs from 'fs';

const [, , inputPath, outPath] = process.argv;

const spec = JSON.parse(
  fs.readFileSync(inputPath || 'src/examples/specs/group.spec.json', 'utf8'),
);

const gltf = JSON.stringify(realiseSpec(spec).build(), null, 2);

fs.writeFileSync(outPath || 'generated/realised-spec.gltf', gltf);
