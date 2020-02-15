import BranchBlueprint from '../../branch/blueprint';
import { prng } from 'seedrandom';
import { flatMap } from 'lodash';

const STALKS_PER_LENGTH_UNIT = 2;
const SEGMENTS_PER_STEM_LENGTH = 2;

const getNoSegments = (length, segmentsPerLength = SEGMENTS_PER_STEM_LENGTH) =>
  Math.ceil(length * segmentsPerLength);

const generateLeafStalks = (
  stemBps: BranchBlueprint[],
  rng: prng,
): BranchBlueprint[] => {
  return flatMap(
    stemBps,
    (stemBp: BranchBlueprint): BranchBlueprint[] => {
      const noStalks = Math.round(stemBp.length * STALKS_PER_LENGTH_UNIT);

      const stalks: BranchBlueprint[] = [];
      for (let i = 0; i < noStalks; i++) {
        // find position from the end part of branch
        const branchPos = (1 - rng() * 0.7) * stemBp.length;

        const branchPoint = stemBp.getBranchSiteAt(
          branchPos,
          [Math.PI * 0.4, Math.PI * 0.5],
          rng,
        );

        const stemLength = (stemBp.length - branchPos) * 0.7;

        stalks[i] = new BranchBlueprint({
          start: branchPoint.position,
          direction: branchPoint.direction,
          length: stemLength,
          width: branchPoint.width * 0.7,
          segments: getNoSegments(stemLength),
          rng,
        });
      }

      return stalks;
    },
  );
};

export const generateCompoundLeaves = ({
  stemBlueprints,
  rng,
}: {
  stemBlueprints: BranchBlueprint[];
  rng: prng;
}): { stalkBlueprints: BranchBlueprint[] } => {
  return { stalkBlueprints: generateLeafStalks(stemBlueprints, rng) };
};
