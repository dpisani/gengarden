import { vec3 } from 'gl-matrix';

export interface StemAxisBlueprint {
  length: number;
  // Get info about point along branch at point defined by the length up from the base
  getAxisInfoAt: (
    length: number,
  ) => {
    position: vec3;
    width: number;
    // the forward direction along the axis from this point
    axisDirection: vec3;
  };
}
