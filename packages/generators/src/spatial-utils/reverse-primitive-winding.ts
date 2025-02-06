import { PrimitiveBlueprint } from "../generators/mesh/index.ts";

/**
 * Reverses the winding order of the given primitive so that the front faces are flipped.
 * @returns a copy of the given primitive, with the polygons flipped
 */
export const reversePrimitiveWinding = (
  primitiveBP: PrimitiveBlueprint,
): PrimitiveBlueprint => ({
  ...primitiveBP,
  polygons: primitiveBP.polygons.map(([a, b, c]) => [c, b, a]),
});
