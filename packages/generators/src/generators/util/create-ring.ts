import { vec3 } from "gl-matrix";
import { angleToVec } from "../../spatial-utils/angle-to-vec";

/**
 * createRing - creates a ring of points around the unit circle
 *
 * @returns {vec3[]} an array of points
 */
export default function (
  {
    plane = "xz",
  }: {
    plane: "xz" | "xy" | "yz";
  } = { plane: "xz" },
): vec3[] {
  const segments = 5;
  const segmentAngle = (Math.PI * 2) / segments;
  return Array.from({ length: segments }).map((x, i) => {
    const a = segmentAngle * i;

    return angleToVec(a, { plane });
  });
}
