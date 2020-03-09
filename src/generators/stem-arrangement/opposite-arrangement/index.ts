import { StemArrangementBlueprint, StemNode } from '..';
import { vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';
import { StemAxisBlueprint } from '../../stem-axis';
import { quat } from 'gl-matrix';

// Nodes of this arrangement are generated in pairs along the axis
export function generateOppositeStemArrangement({
  axis,
  nodePositions,
  upDirection,
  nodeDivergenceLookup,
}: {
  axis: StemAxisBlueprint;
  // positions along the axis (a porportion in the range [0,1]) to place nodes
  nodePositions: number[];
  // rotation around the forward direction to orient the plane the nodes are placed, beginning from the right hand side.
  nodePlacementRotation: number;
  // Lookup function that returns angles in radians that node directions will diverge from the axis' forward direction
  nodeDivergenceLookup: (position: number) => number;
  // global up direction to use when orienting node placements. defaults to the positive Y axis
  upDirection?: vec3;
  rng: prng;
}): StemArrangementBlueprint {
  const upDir = upDirection || vec3.fromValues(0, 1, 0);
  const nodes: StemNode[] = [];

  for (let nodePosition of nodePositions) {
    const nodePoint = axis.getAxisInfoAt(nodePosition * axis.length);

    const leftDir = vec3.cross(vec3.create(), nodePoint.axisDirection, upDir);

    const localUpDir = vec3.cross(
      vec3.create(),
      leftDir,
      nodePoint.axisDirection,
    );

    vec3.normalize(localUpDir, localUpDir);

    const divergence = nodeDivergenceLookup(nodePosition);

    const rightRotator = quat.setAxisAngle(
      quat.create(),
      localUpDir,
      divergence,
    );
    const leftRotator = quat.setAxisAngle(
      quat.create(),
      localUpDir,
      -divergence,
    );

    const leftNodeDir = vec3.transformQuat(
      vec3.create(),
      nodePoint.axisDirection,
      leftRotator,
    );

    const rightNodeDir = vec3.transformQuat(
      vec3.create(),
      nodePoint.axisDirection,
      rightRotator,
    );

    const nodeLeft: StemNode = {
      position: nodePoint.position,
      size: nodePoint.width,
      direction: leftNodeDir,
      branchPosition: nodePosition,
    };

    const nodeRight: StemNode = {
      position: nodePoint.position,
      size: nodePoint.width,
      direction: rightNodeDir,
      branchPosition: nodePosition,
    };

    nodes.push(nodeLeft, nodeRight);
  }

  return { axis, nodes };
}
