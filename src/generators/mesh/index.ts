import {
  Node,
  Mesh,
  Primitive,
  buildIndices,
  buildPosition,
} from 'gltf-builder';
import { vec3 } from 'gl-matrix';

import { TaggedSpec, GeneratorDefinition } from '../../types';

export interface TaggedMeshSpec extends TaggedSpec {
  type: 'mesh';
  spec: {
    geometry: {
      vertices: vec3[];
      indices?: number[];
    };
  };
}

const isValidSpec = (taggedSpec: TaggedSpec): taggedSpec is TaggedMeshSpec => {
  const { spec, type } = taggedSpec;
  return type === 'mesh' && spec.geometry !== undefined;
};

const generate = ({ spec }: TaggedMeshSpec): Node => {
  const { vertices, indices } = spec.geometry;

  const positionsAccessor = buildPosition(vertices);
  const primitive = new Primitive().position(positionsAccessor);

  if (indices) {
    const indicesAccessor = buildIndices(indices);
    primitive.indices(indicesAccessor);
  }

  return new Node().mesh(new Mesh().addPrimitive(primitive));
};

const generatorDefinition: GeneratorDefinition<TaggedMeshSpec, Node> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
