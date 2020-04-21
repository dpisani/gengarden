import { vec3 } from 'gl-matrix';
import {
  buildIndices,
  buildPosition,
  Material,
  Mesh,
  Primitive,
} from 'gltf-builder';

import { GeneratorDefinition, TaggedSpec } from '../../types';

export interface MeshSpec {
  geometry: {
    vertices: vec3[];
    indices?: number[];
  };
  material?: Material;
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

const generate = (spec: MeshSpec): Mesh => {
  const { vertices, indices } = spec.geometry;

  const positionsAccessor = buildPosition(vertices);
  const primitive = new Primitive().position(positionsAccessor);

  if (spec.material) {
    primitive.material(spec.material);
  }

  if (indices) {
    const indicesAccessor = buildIndices(indices);
    primitive.indices(indicesAccessor);
  }

  return new Mesh().addPrimitive(primitive);
};

const generatorDefinition: GeneratorDefinition<MeshSpec, Mesh> = {
  generate,
  isValidSpec,
};

export default generatorDefinition;
