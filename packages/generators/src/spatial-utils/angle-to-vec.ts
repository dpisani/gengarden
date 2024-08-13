import { vec3 } from "gl-matrix";

/**
 * angleToVec - creates a heading vector pointing at an specied angle away from the up vector
 *
 * @returns {vec3} a unit vector
 */
export const angleToVec = (
  a: number,
  {
    plane = "xz",
  }: {
    plane?: "xz" | "xy" | "yz";
  } = {},
): vec3 => {
  switch (plane) {
    case "xy":
      return vec3.fromValues(Math.cos(a), Math.sin(a), 0);
    case "xz":
      return vec3.fromValues(Math.cos(a), 0, Math.sin(a));
    case "yz":
      return vec3.fromValues(0, Math.cos(a), Math.sin(a));
  }
};
