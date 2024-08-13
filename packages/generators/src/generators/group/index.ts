import { Node } from "gltf-builder";

import { GeneratorDefinition, TaggedSpec } from "../../types";

interface GroupSpec {
  name?: string;
  items: Node[];
}

export interface TaggedGroupSpec extends TaggedSpec<GroupSpec> {
  type: "group";
}

export const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedGroupSpec => {
  const { type, spec } = taggedSpec;
  if (type === "group" && spec.items) {
    const items = spec.items;
    if (Array.isArray(items)) {
      return items.every((i) => i instanceof Node);
    }
  }

  return false;
};

export const generate = (spec: GroupSpec): Node => {
  const node = new Node();

  if (spec.name) {
    node.name(spec.name);
  }

  spec.items.forEach((item) => node.addChild(item));

  return node;
};

export const groupGeneratorDefinition: GeneratorDefinition<GroupSpec, Node> = {
  generate,
  isValidSpec,
};

export default generate;
