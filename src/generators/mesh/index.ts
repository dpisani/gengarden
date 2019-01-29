import {
  Node,
  Mesh,
  Primitive,
  buildIndices,
  buildPosition,
} from 'gltf-builder';
import { vec3 } from 'gl-matrix';

import { TaggedSpec, GeneratorDefinition } from '../../types';

export interface MeshSpec {
  geometry: {
    vertices: vec3[];
    indices?: number[];
  };
}

export interface TaggedMeshSpec extends TaggedSpec<MeshSpec> {
  type: 'mesh';
}

const isValidSpec = (
  taggedSpec: TaggedSpec<any>,
): taggedSpec is TaggedMeshSpec => {
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

const generatorDefinition: GeneratorDefinition<MeshSpec, Node> = {
  isValidSpec,
  generate,
};

export default generatorDefinition;
