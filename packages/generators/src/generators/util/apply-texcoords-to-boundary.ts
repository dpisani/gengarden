import { vec2, vec3 } from "gl-matrix";
import BoundingBox, {
  createBoundingBoxFromPoints,
  createBoxTransformer,
} from "../../bounding-volumes/box/index.ts";
import { PrimitiveVertex } from "../mesh/index.ts";

/**
 * Takes the points representing the hull of a mesh and adds texture coordinates to it.
 * The mesh must lie flat along the XY plane.
 */
export const applyTexcoordsToBoundary = (boundary: PrimitiveVertex[]) => {
  const leafBoundaryBox = createBoundingBoxFromPoints(
    boundary.map((p) => p.position),
  );

  const texCoordBox = new BoundingBox(vec3.create(), vec3.fromValues(1, 1, 0));

  const transformToTexCoord = createBoxTransformer(
    leafBoundaryBox,
    texCoordBox,
  );

  boundary.forEach((v) => {
    const transformed = transformToTexCoord(v.position);
    v.texcoord = vec2.fromValues(transformed[0], transformed[1]);
  });
};
