import { Asset, Scene } from 'gltf-builder';
import generateSnowBush from '@gengarden/generators/target/build/src/generators/plants/snow-bush';
import * as fs from 'fs-extra';
import * as path from 'path';

const outputPath = path.resolve('models/snow-bush.gltf');

const model = generateSnowBush({
  randomSeed: 'seed',
});

const gltf = new Asset().addScene(new Scene().addNode(model)).build();

fs.writeJSON(outputPath, gltf, { spaces: 2 });
