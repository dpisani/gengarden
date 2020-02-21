import { generateOppositeStemArrangement } from './index';
import { StemAxisBlueprint } from '../../stem-axis';
import { vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';
import assert from 'assert';

const createMockRng = (): prng => {
  const rng = () => 0.5;
  rng.quick = () => 0.5;
  rng.double = () => 0.5;
  rng.int32 = () => {
    throw new Error('not implemented');
  };
  rng.state = () => {
    throw new Error('not implemented');
  };

  return (rng as unknown) as prng;
};

describe('opposite stem arrangement generator', () => {
  const mockAxis: StemAxisBlueprint = {
    length: 1,
    getAxisInfoAt: l => {
      return {
        position: vec3.fromValues(l, 0, 0),
        width: 1,
        axisDirection: vec3.fromValues(1, 0, 0),
      };
    },
  };

  it('creates pairs of nodes per node position', () => {
    const arrangement = generateOppositeStemArrangement({
      axis: mockAxis,
      rng: createMockRng(),
      nodePlacementRotation: 0,
      nodeDivergenceRange: [0, 0],
      nodePositions: [0.5, 1],
    });

    const [node1, node2, node3, node4] = arrangement.nodes;

    assert.equal(arrangement.nodes.length, 4);
  });

  it('places pairs at the specified place along the axis', () => {
    const arrangement = generateOppositeStemArrangement({
      axis: mockAxis,
      rng: createMockRng(),
      nodePlacementRotation: 0,
      nodeDivergenceRange: [0, 0],
      nodePositions: [0.5, 1],
    });

    const [node1, node2, node3, node4] = arrangement.nodes;

    assert.deepStrictEqual(node1.position, vec3.fromValues(0.5, 0, 0));
    assert.deepStrictEqual(node2.position, vec3.fromValues(0.5, 0, 0));

    assert.deepStrictEqual(node3.position, vec3.fromValues(1, 0, 0));
    assert.deepStrictEqual(node4.position, vec3.fromValues(1, 0, 0));
  });

  it('places pairs facing opposite directions along the axis', () => {
    const arrangement = generateOppositeStemArrangement({
      axis: mockAxis,
      rng: createMockRng(),
      nodePlacementRotation: 0,
      nodeDivergenceRange: [Math.PI / 2, Math.PI / 2],
      nodePositions: [0.5, 1],
    });

    const [node1, node2, node3, node4] = arrangement.nodes;

    assert.deepStrictEqual(node1.direction, vec3.fromValues(0, 0, 1));
    assert.deepStrictEqual(node2.direction, vec3.fromValues(-0, -0, -1)); // because -0 !== 0 for some reason

    assert.deepStrictEqual(node3.direction, vec3.fromValues(0, 0, 1));
    assert.deepStrictEqual(node4.direction, vec3.fromValues(-0, -0, -1));
  });

  it.skip('faces nodes at an angle away from the axis defined by a given divergence range', () => {});

  it.skip('rotates node placements around the stem axis as defined by a given placement rotation', () => {});
});
