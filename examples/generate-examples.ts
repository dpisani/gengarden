import * as path from 'path';

const [, , ...specs] = process.argv;

const execAllSpecs = async () => {
  for (const spec of specs) {
    console.log('Generating: ', spec);

    require(path.resolve(spec));
  }
};

execAllSpecs().catch(e => console.error(e));
