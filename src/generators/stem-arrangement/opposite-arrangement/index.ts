import { StemArrangementBlueprint, StemNode } from '..';
import { vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';
import { StemAxisBlueprint } from '../../stem-axis';

// Nodes of this arrangement are generated in pairs along the axis
export function generateOppositeStemArrangement({
  axis,
  nodePositions,
  upDirection,
}: {
  axis: StemAxisBlueprint;
  // positions along the axis (by length from the base) to place nodes
  nodePositions: number[];
  // rotation around the forward direction to orient the plane the nodes are placed, beginning from the right hand side.
  nodePlacementRotation: number;
  // Angle range in radians that node directions will diverge from the axis' forward direction
  nodeDivergenceRange: [number, number];
  // global up direction to use when orienting node placements. defaults to the positive Y axis
  upDirection?: vec3;
  rng: prng;
}): StemArrangementBlueprint {
  const upDir = upDirection || vec3.fromValues(0, 1, 0);
  const nodes: StemNode[] = [];

  for (let nodePosition of nodePositions) {
    const nodePoint = axis.getAxisInfoAt(nodePosition);

    const leftDir = vec3.cross(vec3.create(), nodePoint.axisDirection, upDir);
    vec3.normalize(leftDir, leftDir);

    const nodeLeft: StemNode = {
      position: nodePoint.position,
      size: nodePoint.width,
      direction: leftDir,
    };

    const nodeRight: StemNode = {
      position: nodePoint.position,
      size: nodePoint.width,
      direction: vec3.negate(vec3.create(), leftDir),
    };

    nodes.push(nodeLeft, nodeRight);
  }

  return { axis, nodes };
}
