import { vec3 } from "gl-matrix";
import { KeypointStemAxisBlueprint } from "../../../stem-axis/keypoint-stem-axis/index.ts";
import { KeypointLeafletBlueprint } from "../blueprint.ts";
import { generateSimpleLeafBladeBoundary } from "./simple-blade.ts";

export interface SimpleLeafletBlueprintGeneratorSpec {
  // Length of the stem section preceeding the main leaflet
  stemLength: number;
  stemWidth: number;
  leafletLength: number;
  leafletWidth: number;
  // Position of the widest part of the leaflet, expressed in the range [0,1]
  leafletMidpointPosition: number;
}

/**
 *  Creates a leaflet by combining simple shapes for the base and tip of the blade.
 *  Leaflet is oriented along the XZ plane pointing along the -Z axis, so it can be redirected with a targetTo.
 */
export const generateSimpleLeafletBlueprint = (
  spec: SimpleLeafletBlueprintGeneratorSpec,
): KeypointLeafletBlueprint => {
  const {
    stemLength,
    stemWidth,
    leafletLength,
    leafletWidth,
    leafletMidpointPosition,
  } = spec;

  const fullLength = leafletLength + stemLength;
  const stemAxis = new KeypointStemAxisBlueprint([
    { position: vec3.fromValues(0, 0, 0), width: stemWidth },
    { position: vec3.fromValues(0, 0, -fullLength), width: 0 },
  ]);

  const leafBladeBoundary = generateSimpleLeafBladeBoundary({
    width: leafletWidth,
    length: leafletLength,
    midpoint: leafletMidpointPosition,
  });

  const bladeOffset = vec3.fromValues(0, 0, -stemLength);
  leafBladeBoundary.forEach(({ position }) =>
    vec3.add(position, position, bladeOffset),
  );

  return { stem: stemAxis, bladeBoundaries: [leafBladeBoundary] };
};
