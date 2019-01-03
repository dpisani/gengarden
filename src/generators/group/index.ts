import { Node } from 'gltf-builder';

import { TaggedSpec, GeneratorDefinition } from '../../types';

interface GroupSpec {
  name?: string;
  items: Node[];
}

interface TaggedGroupSpec extends TaggedSpec {
  type: 'group';
  spec: GroupSpec;
}

export const isValidSpec = (
  taggedSpec: TaggedSpec,
): taggedSpec is TaggedGroupSpec => {
  const { type, spec } = taggedSpec;
  if (type === 'group' && spec.items) {
    return true;
  }

  return false;
};

export const generate = ({ spec }: TaggedGroupSpec): Node => {
  const node = new Node();

  if (spec.name) {
    node.name(spec.name);
  }

  spec.items.forEach(item => node.addChild(item));

  return node;
};

const generatorDefinition: GeneratorDefinition<TaggedGroupSpec> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
