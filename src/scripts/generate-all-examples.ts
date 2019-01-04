import realiseSpec from '../coordinators/realiser';

import * as fs from 'fs';

fs.mkdirSync('examples/models', { recursive: true });

fs.readdirSync('examples/models').forEach(f =>
  fs.unlinkSync(`examples/models/${f}`),
);

fs.readdirSync('examples/specs')
  .filter(f => f.endsWith('spec.json'))
  .forEach(f => {
    const spec = JSON.parse(fs.readFileSync(`examples/specs/${f}`, 'utf8'));

    const gltf = JSON.stringify(realiseSpec(spec).build(), null, 2);

    fs.writeFileSync(
      `examples/models/${f.slice(0, -'.spec.json'.length)}.gltf`,
      gltf,
    );
  });
