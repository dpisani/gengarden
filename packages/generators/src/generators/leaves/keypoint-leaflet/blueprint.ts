import { Texture } from "gltf-builder";
import { PrimitiveVertex } from "../../mesh/index.ts";
import { StemAxisBlueprint } from "../../stem-axis/index.ts";

/**
 * A representation of a single leaflet defined by a ring of
 * keypoints around the blade and a central stem
 */
export type KeypointLeafletBlueprint = {
  stem: StemAxisBlueprint;
} & KeypointBladeBlueprint;

/**
 * Represents a flat blade defined by a set of polygon boundaries.
 */
export type KeypointBladeBlueprint = {
  // A collection of simple polygons. Not necessarily convex.
  bladeBoundaries: PrimitiveVertex[][];
  // A buffer containing image data
  bladeTexture?: Texture;
};
