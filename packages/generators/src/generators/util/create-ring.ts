import { vec3 } from "gl-matrix";
import { angleToVec } from "../../spatial-utils/angle-to-vec.ts";

/**
 * createRing - creates a ring of points around the unit circle
 *
 * @returns {vec3[]} an array of points
 */
export default function (
  {
    plane = "xz",
    numPoints,
  }: {
    plane?: "xz" | "xy" | "yz";
    /** How many points to create on the ring */
    numPoints?: number;
  } = { plane: "xz" },
): vec3[] {
  const segments = numPoints ?? 5;
  const segmentAngle = (Math.PI * 2) / segments;
  return Array.from({ length: segments }).map((x, i) => {
    const a = segmentAngle * i;

    return angleToVec(a, { plane });
  });
}
