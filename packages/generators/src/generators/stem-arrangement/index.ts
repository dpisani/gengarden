import { vec3 } from "gl-matrix";
import { StemAxisBlueprint } from "../stem-axis";

export interface StemNode {
  position: vec3;
  // Direction that the offshoot from this node should face
  direction: vec3;
  size: number;
  // Number in the range [0,1] that designates how far up the branch the node lies
  branchPosition: number;
}

export interface StemArrangementBlueprint {
  axis: StemAxisBlueprint;
  nodes: StemNode[];
}
