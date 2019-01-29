import { Node } from 'gltf-builder';

import { TaggedSpec, GeneratorDefinition } from '../../types';

interface GroupSpec {
  name?: string;
  items: Node[];
}

export interface TaggedGroupSpec extends TaggedSpec<GroupSpec> {
  type: 'group';
}

export const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedGroupSpec => {
  const { type, spec } = taggedSpec;
  if (type === 'group' && spec.items) {
    const items = spec.items;
    if (Array.isArray(items)) {
      return items.every(i => i instanceof Node);
    }
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

const generatorDefinition: GeneratorDefinition<GroupSpec, Node> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
