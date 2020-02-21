import { vec3 } from 'gl-matrix';
import { StemAxisBlueprint } from '../stem-axis';

export interface StemNode {
  position: vec3;
  // Direction that the offshoot from this node should face
  direction: vec3;
  size: number;
}

export interface StemArrangementBlueprint {
  axis: StemAxisBlueprint;
  nodes: StemNode[];
}
