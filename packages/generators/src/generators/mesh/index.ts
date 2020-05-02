import { vec2, vec3 } from 'gl-matrix';
import {
  Material,
  Mesh,
  Primitive,
  buildVec3Accessor,
  buildUIntAccessor,
  buildVec2Accessor,
} from 'gltf-builder';

import { flatten } from 'lodash';

export interface MeshVertex {
  position: vec3;
  texcoord?: vec2;
}

export interface MeshBlueprint {
  vertices: MeshVertex[];
  // Triangles defined as indices to the main vertex list
  polygons: [number, number, number][];
  material?: Material;
}

export interface MeshSpec {
  geometry: {
    vertices: vec3[];
    indices?: number[];
  };
}
export const generateMesh = (meshBp: MeshBlueprint): Mesh => {
  const positions = meshBp.vertices.map(v => v.position);
  const indices = flatten(meshBp.polygons);
  const texcoords: vec2[] = meshBp.vertices
    .map(v => v.texcoord)
    .filter((t): t is vec2 => t !== undefined);

  const positionsAccessor = buildVec3Accessor(positions);
  const primitive = new Primitive().position(positionsAccessor);

  if (meshBp.material) {
    primitive.material(meshBp.material);
  }

  if (indices) {
    const indicesAccessor = buildUIntAccessor(indices);
    primitive.indices(indicesAccessor);
  }

  if (texcoords.length > 0) {
    const texcoordAccessor = buildVec2Accessor(texcoords);
    primitive.texcoord(texcoordAccessor);
  }

  return new Mesh().addPrimitive(primitive);
};
