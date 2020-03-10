import { StemAxisBlueprint } from '../../stem-axis';
import { prng } from 'seedrandom';
import createDeviation from '../../util/create-devitaion';
import { StemArrangementBlueprint } from '..';

/**
 * A branching arrangement where nodes are placed randomly within a permitted deviation range
 * from the main axis
 */

interface GeneratorProps {
  axis: StemAxisBlueprint;
  // positions along the axis (a porportion in the range [0,1]) to place nodes
  nodePositions: number[];
  // angle range in radians that nodes may be angled away from the main axis direction
  deviationRange: [number, number];
  rng: prng;
}

const generateScatteredStemArrangement = ({
  axis,
  nodePositions,
  deviationRange,
  rng,
}: GeneratorProps): StemArrangementBlueprint => {
  const nodes = nodePositions.map(branchPosition => {
    const branchPoint = axis.getAxisInfoAt(branchPosition);

    return {
      position: branchPoint.position,
      direction: createDeviation(
        branchPoint.axisDirection,
        deviationRange[0],
        deviationRange[1],
        rng,
      ),
      size: branchPoint.width,
      branchPosition,
    };
  });

  return { axis, nodes };
};

export default generateScatteredStemArrangement;
