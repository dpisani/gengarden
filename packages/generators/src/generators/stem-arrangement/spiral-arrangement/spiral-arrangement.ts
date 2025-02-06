import { vec3 } from "gl-matrix";
import { UP_VECTOR } from "../../../spatial-utils/vector-util.ts";
import { StemAxisBlueprint } from "../../stem-axis/index.ts";
import { createDeviation } from "../../util/create-devitaion.ts";
import { fibbonaci } from "../../util/math.ts";
import { StemArrangementBlueprint, StemNode } from "../index.ts";

export interface SpiralArrangementSpec {
  axis: StemAxisBlueprint;
  /** Positions along the axis (a porportion in the range [0,1]) to place nodes */
  nodePositions: number[];
  /** Determines the angle at which nodes in the arrangement diverge from one another, using the fibbonaci sequence. Must be an integer */
  spiralLevel: number;
  /** Lookup function that returns angles in radians that node directions will diverge from the axis' forward direction */
  forwardDivergenceLookup: (position: number) => number;
  /** Angle in radians to offset the beginning of the spiral sequence */
  spiralOffset?: number;
}

export const generateSpiralArrangementBlueprint = ({
  axis,
  nodePositions,
  spiralLevel,
  forwardDivergenceLookup,
  spiralOffset,
}: SpiralArrangementSpec): StemArrangementBlueprint => {
  const leftDir = vec3.fromValues(0, 0.0001, 0);
  const spiralDivergence =
    (fibbonaci(spiralLevel) / fibbonaci(spiralLevel + 2)) * Math.PI * 2;
  const spiralStart = spiralOffset ?? 0;

  const nodes: StemNode[] = nodePositions.sort().map((pos, i) => {
    const nodePoint = axis.getAxisInfoAt(pos);

    const rotationAngle = spiralDivergence * i + spiralStart;

    const nodeDir = createDeviation(
      nodePoint.axisDirection,
      forwardDivergenceLookup(pos),
      rotationAngle,
      vec3.exactEquals(nodePoint.axisDirection, UP_VECTOR)
        ? leftDir
        : UP_VECTOR,
    );

    // Find the position on the surface of the stem axis
    const tangentDir = vec3.cross(
      vec3.create(),
      nodePoint.axisDirection,
      nodeDir,
    );
    vec3.normalize(tangentDir, tangentDir);

    const normalDir = vec3.cross(
      vec3.create(),
      tangentDir,
      nodePoint.axisDirection,
    );
    vec3.normalize(normalDir, normalDir);

    const position = vec3.scale(vec3.create(), normalDir, nodePoint.width);
    vec3.add(position, position, nodePoint.position);

    return {
      position: position,
      size: nodePoint.width,
      direction: nodeDir,
      branchPosition: pos,
    };
  });

  return { axis, nodes };
};
