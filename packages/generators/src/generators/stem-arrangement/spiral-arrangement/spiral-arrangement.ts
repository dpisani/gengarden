import { StemArrangementBlueprint, StemNode } from "..";
import { fibbonaci } from "../../util/math";
import { StemAxisBlueprint } from "../../stem-axis";
import { vec3 } from "gl-matrix";
import { createDeviation } from "../../util/create-devitaion";

export interface SpiralArrangementSpec {
  axis: StemAxisBlueprint;
  // Positions along the axis (a porportion in the range [0,1]) to place nodes
  nodePositions: number[];
  // Determines the angle at which nodes in the arrangement diverge from one another, using the fibbonaci sequence.
  // Must be an integer
  spiralLevel: number;
  // Lookup function that returns angles in radians that node directions will diverge from the axis' forward direction
  forwardDivergenceLookup: (position: number) => number;
  // Angle in radians to offset the beginning of the spiral sequence
  spiralOffset?: number;
}

export const generateSpiralArrangementBlueprint = ({
  axis,
  nodePositions,
  spiralLevel,
  forwardDivergenceLookup,
  spiralOffset,
}: SpiralArrangementSpec): StemArrangementBlueprint => {
  const upDir = vec3.fromValues(0, 1, 0);
  const spiralDivergence =
    (fibbonaci(spiralLevel) / fibbonaci(spiralLevel + 2)) * Math.PI * 2;
  const spiralStart = spiralOffset ?? 0;

  const nodes: StemNode[] = nodePositions.sort().map((pos, i) => {
    const nodePoint = axis.getAxisInfoAt(pos);

    const leftDir = vec3.cross(vec3.create(), nodePoint.axisDirection, upDir);

    const localUpDir = vec3.cross(
      vec3.create(),
      leftDir,
      nodePoint.axisDirection,
    );

    vec3.normalize(localUpDir, localUpDir);

    const rotationAngle = spiralDivergence * i + spiralStart;

    const nodeDir = createDeviation(
      nodePoint.axisDirection,
      forwardDivergenceLookup(pos),
      rotationAngle,
    );

    return {
      position: nodePoint.position,
      size: nodePoint.width,
      direction: nodeDir,
      branchPosition: pos,
    };
  });

  return { axis, nodes };
};
