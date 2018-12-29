import realiseSpec from '../coordinators/realiser';

import * as fs from 'fs';

const [, , ...args] = process.argv;

const spec = JSON.parse(
  fs.readFileSync(args[0] || 'src/examples/specs/group.spec.json', 'utf8'),
);

const gltf = JSON.stringify(realiseSpec(spec).build(), null, 2);

console.log(gltf);
