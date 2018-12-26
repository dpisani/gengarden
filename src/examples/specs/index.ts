import realiseSpec from '../../coordinators/realiser';

import * as fs from 'fs';

const spec = JSON.parse(
  fs.readFileSync('src/examples/specs/group.spec.json', 'utf8'),
);

const gltf = JSON.stringify(realiseSpec(spec).build(), null, 2);

fs.mkdirSync('generated', { recursive: true });
fs.writeFileSync('generated/realised-spec.gltf', gltf);
