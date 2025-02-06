import { vec3 } from "gl-matrix";
import _ from "lodash-es";
import tess2 from "tess2";
import { reversePrimitiveWinding } from "../../../../spatial-utils/reverse-primitive-winding.ts";
import { PrimitiveBlueprint, PrimitiveVertex } from "../../../mesh/index.ts";

const { flatMap } = _;
const { tesselate } = tess2;

export const triangulateBoundary = (
  boundary: PrimitiveVertex[],
  /** Normal vector from the plane the boundary sits on. If not provided defaults to [0, 1, 0] */
  normal?: vec3,
): PrimitiveBlueprint => {
  const contour = flatMap(boundary, ({ position: [x, y, z] }) => [-x, y, z]);

  const tesselation = tesselate({
    contours: [contour],
    normal: Array.from(normal ?? [0, 1, 0]) as [number, number, number],
    vertexSize: 3,
  });

  if (!tesselation) {
    throw new Error("Could not create a triangulation");
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

  return reversePrimitiveWinding({ vertices, polygons });
};
