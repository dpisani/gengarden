import { vec3 } from "gl-matrix";

export interface StemAxisBlueprint {
  length: number;
  // Get info about point along branch at point defined by the position from the base in the range [0,1]
  getAxisInfoAt: (position: number) => {
    position: vec3;
    width: number;
    // the forward direction along the axis from this point
    axisDirection: vec3;
  };
}
