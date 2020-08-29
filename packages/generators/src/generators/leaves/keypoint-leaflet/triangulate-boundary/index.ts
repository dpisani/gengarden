import { vec3 } from 'gl-matrix';
import { flatMap } from 'lodash';
import { tesselate } from 'tess2';
import { PrimitiveVertex, PrimitiveBlueprint } from '../../../mesh';

export default (boundary: PrimitiveVertex[]): PrimitiveBlueprint => {
  const contour = flatMap(boundary, ({ position: [x, y, z] }) => [x, y, z]);

  const tesselation = tesselate({
    contours: [contour],
    normal: [0, 0, 1],
    vertexSize: 3,
  });

  if (!tesselation) {
    throw new Error('Could not create a triangulation');
  }

  // create vertices out of what's returned in the triangulation
  const vertices: PrimitiveVertex[] = [];

  for (let i = 0; i < tesselation.vertexIndices.length; i++) {
    vertices[i] = boundary[tesselation.vertexIndices[i]];
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
