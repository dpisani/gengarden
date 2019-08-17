import { vec3 } from 'gl-matrix';

export interface BoundingVolume {
  containsPoint: (p: vec3) => boolean;
}
