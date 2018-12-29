import { Node } from 'gltf-builder';

interface GroupSpec {
  name?: string;
  items: Node[];
}

export default (spec: GroupSpec): Node => {
  const node = new Node();

  if (spec.name) {
    node.name(spec.name);
  }

  spec.items.forEach(item => node.addChild(item));

  return node;
};
