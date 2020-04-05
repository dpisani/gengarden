import { StemAxisBlueprint } from '../../stem-axis';
import { vec3 } from 'gl-matrix';

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
  bladeBoundaries: vec3[][];
}
