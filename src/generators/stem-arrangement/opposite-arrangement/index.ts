import { StemArrangementBlueprint, StemNode } from '..';
import { vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';
import { StemAxisBlueprint } from '../../stem-axis';
import { quat } from 'gl-matrix';

export interface GeneratorProps {
  axis: StemAxisBlueprint;
  // positions along the axis (a porportion in the range [0,1]) to place nodes
  nodePositions: number[];
  // rotation around the forward direction to orient the plane the nodes are placed, beginning from the right hand side.
  nodePlacementRotation: number;
  // Lookup function that returns angles in radians that node directions will diverge from the axis' forward direction
  nodeDivergenceLookup: (position: number) => number;
  // global up direction to use when orienting node placements. defaults to the positive Y axis
  upDirection?: vec3;
  // pattern for which nodes are placed
  placementScheme: PlacementScheme;
  rng: prng;
}

export enum PlacementScheme {
  PAIRS, // Nodes are generated in pairs facing opposite directions
  ALTERNATING, // Nodes are generated in opposite directions alternating along the axis
}

// Nodes of this arrangement are generated along a single plane along the axis
export function generateOppositeStemArrangement({
  axis,
  nodePositions,
  upDirection,
  nodeDivergenceLookup,
  placementScheme,
}: GeneratorProps): StemArrangementBlueprint {
  const upDir = upDirection || vec3.fromValues(0, 1, 0);
  const nodes: StemNode[] = [];

  let alternatingLeft = true;

  for (let nodePosition of nodePositions) {
    const nodePoint = axis.getAxisInfoAt(nodePosition);

    const leftDir = vec3.cross(vec3.create(), nodePoint.axisDirection, upDir);

    const localUpDir = vec3.cross(
      vec3.create(),
      leftDir,
      nodePoint.axisDirection,
    );

    vec3.normalize(localUpDir, localUpDir);

    const divergence = nodeDivergenceLookup(nodePosition);

    if (alternatingLeft || placementScheme === PlacementScheme.PAIRS) {
      const nodeLeft: StemNode = createNode({
        axisInfo: nodePoint,
        divergence: -divergence,
        localUpDir,
        branchPosition: nodePosition,
      });

      nodes.push(nodeLeft);
    }

    if (!alternatingLeft || placementScheme === PlacementScheme.PAIRS) {
      const nodeRight: StemNode = createNode({
        axisInfo: nodePoint,
        divergence: divergence,
        localUpDir,
        branchPosition: nodePosition,
      });

      nodes.push(nodeRight);
    }

    alternatingLeft = !alternatingLeft;
  }

  return { axis, nodes };
}

const createNode = ({
  axisInfo,
  localUpDir,
  divergence,
  branchPosition,
}: {
  axisInfo: {
    position: vec3;
    width: number;
    axisDirection: vec3;
  };
  branchPosition: number;

  localUpDir: vec3;
  divergence: number;
}): StemNode => {
  const rotator = quat.setAxisAngle(quat.create(), localUpDir, divergence);

  const nodeDir = vec3.transformQuat(
    vec3.create(),
    axisInfo.axisDirection,
    rotator,
  );

  return {
    position: axisInfo.position,
    size: axisInfo.width,
    direction: nodeDir,
    branchPosition: branchPosition,
  };
};
