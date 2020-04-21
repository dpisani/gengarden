import { vec3 } from 'gl-matrix';
import { flatMap } from 'lodash';
import { tesselate } from 'tess2';

export interface MeshBlueprint {
  vertices: vec3[];
  // Triangles defined as indices to the main vertex list
  polygons: [number, number, number][];
}

export default (boundary: vec3[]): MeshBlueprint => {
  const contour = flatMap(boundary, ([x, y, z]) => [x, y, z]);

  const tesselation = tesselate({
    contours: [contour],
    normal: [0, 0, 1],
    vertexSize: 3,
  });

  if (!tesselation) {
    throw new Error('Could not create a triangulation');
  }

  // create vertices out of what's returned in the triangulation
  const vertices: vec3[] = [];
  for (let i = 0; i < tesselation.vertexCount; i++) {
    const arrayOffset = i * 3;
    vertices[i] = vec3.fromValues(
      tesselation.vertices[arrayOffset],
      tesselation.vertices[arrayOffset + 1],
      tesselation.vertices[arrayOffset + 2],
    );
  }

  const polygons: [number, number, number][] = [];
  for (let i = 0; i < tesselation.elementCount; i++) {
    const s = i * 3;
    polygons[i] = [
      tesselation.elements[s],
      tesselation.elements[s + 1],
      tesselation.elements[s + 2],
    ];
  }

  return { vertices, polygons };
};
