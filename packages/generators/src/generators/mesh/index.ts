import { vec2, vec3 } from "gl-matrix";
import {
  Material,
  Mesh,
  Primitive,
  buildUIntAccessor,
  buildVec2Accessor,
  buildVec3Accessor,
} from "gltf-builder";

import { flatten } from "lodash-es";

export interface PrimitiveVertex {
  position: vec3;
  texcoord?: vec2;
}

export interface PrimitiveBlueprint {
  vertices: PrimitiveVertex[];
  // Triangles defined as indices to the main vertex list
  polygons: [number, number, number][];
  material?: Material;
}

export interface MeshBlueprint {
  primitives: PrimitiveBlueprint[];
}

export interface MeshSpec {
  geometry: {
    vertices: vec3[];
    indices?: number[];
  };
}
export const generatePrimitive = (
  primitiveBp: PrimitiveBlueprint,
): Primitive => {
  const positions = primitiveBp.vertices.map((v) => v.position);
  const indices = flatten(primitiveBp.polygons);
  const texcoords: vec2[] = primitiveBp.vertices
    .map((v) => v.texcoord)
    .filter((t): t is vec2 => t !== undefined);

  const positionsAccessor = buildVec3Accessor(positions);
  const primitive = new Primitive().position(positionsAccessor);

  if (primitiveBp.material) {
    primitive.material(primitiveBp.material);
  }

  if (indices) {
    const indicesAccessor = buildUIntAccessor(indices);
    primitive.indices(indicesAccessor);
  }

  if (texcoords.length > 0) {
    const texcoordAccessor = buildVec2Accessor(texcoords);
    primitive.texcoord(texcoordAccessor);
  }

  return primitive;
};

export const generateMesh = (
  meshBp: MeshBlueprint | PrimitiveBlueprint,
): Mesh => {
  if ("primitives" in meshBp) {
    const mesh = new Mesh();

    for (const p of meshBp.primitives) {
      mesh.addPrimitive(generatePrimitive(p));
    }
    return mesh;
  }

  return new Mesh().addPrimitive(generatePrimitive(meshBp));
};
