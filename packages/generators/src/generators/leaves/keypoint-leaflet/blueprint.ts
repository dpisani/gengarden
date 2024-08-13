import { StemAxisBlueprint } from "../../stem-axis";
import { PrimitiveVertex } from "../../mesh";
import { Texture } from "gltf-builder";

/**
 * A representation of a single leaflet defined by a ring of
 * keypoints around the blade and a central stem
 *
 * @export
 * @interface KeypointLeafletBlueprint
 */
export interface KeypointLeafletBlueprint {
  stem: StemAxisBlueprint;
  // A collection of simple polygons. Not necessarily convex.
  bladeBoundaries: PrimitiveVertex[][];
  // A buffer containing image data
  bladeTexture?: Texture;
}
