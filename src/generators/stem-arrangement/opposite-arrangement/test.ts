import { generateOppositeStemArrangement, PlacementScheme } from './index';
import { StemAxisBlueprint } from '../../stem-axis';
import { vec3 } from 'gl-matrix';
import { prng } from 'seedrandom';
import assert from 'assert';
import 'should';

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

const assertIsClose = (a: vec3, b: vec3) => {
  a[0].should.be.approximately(b[0], 0.01);
  a[1].should.be.approximately(b[1], 0.01);
  a[2].should.be.approximately(b[2], 0.01);
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

  describe('pairs node placement', () => {
    it('creates pairs of nodes per node position', () => {
      const arrangement = generateOppositeStemArrangement({
        axis: mockAxis,
        rng: createMockRng(),
        nodePlacementRotation: 0,
        nodeDivergenceLookup: () => 0,
        nodePositions: [0.5, 1],
        placementScheme: PlacementScheme.PAIRS,
      });

      const [node1, node2, node3, node4] = arrangement.nodes;

      arrangement.nodes.should.have.length(4);

      assert.equal(arrangement.nodes.length, 4);
    });

    it('places pairs at the specified place along the axis', () => {
      const arrangement = generateOppositeStemArrangement({
        axis: mockAxis,
        rng: createMockRng(),
        nodePlacementRotation: 0,
        nodeDivergenceLookup: () => 0,
        nodePositions: [0.5, 1],
        placementScheme: PlacementScheme.PAIRS,
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
        nodeDivergenceLookup: () => Math.PI / 2,
        nodePositions: [0.5, 1],
        placementScheme: PlacementScheme.PAIRS,
      });

      const [node1, node2, node3, node4] = arrangement.nodes;

      assertIsClose(node1.direction, vec3.fromValues(0, 0, 1));
      assertIsClose(node2.direction, vec3.fromValues(0, 0, -1));

      assertIsClose(node3.direction, vec3.fromValues(0, 0, 1));
      assertIsClose(node4.direction, vec3.fromValues(0, 0, -1));
    });

    it('faces nodes at an angle away from the axis defined by a given divergence function', () => {
      const arrangement = generateOppositeStemArrangement({
        axis: mockAxis,
        rng: createMockRng(),
        nodePlacementRotation: 0,
        nodeDivergenceLookup: () => Math.PI / 4,
        nodePositions: [0.5],
        placementScheme: PlacementScheme.PAIRS,
      });

      const [node1, node2] = arrangement.nodes;

      assertIsClose(node1.direction, vec3.fromValues(0.707, 0, 0.707));
      assertIsClose(node2.direction, vec3.fromValues(0.707, 0, -0.707));
    });

    it.skip('rotates node placements around the stem axis as defined by a given placement rotation', () => {});
  });

  describe('alternating node placement', () => {
    it('creates nodes facing alternating directions along an axis', () => {
      const arrangement = generateOppositeStemArrangement({
        axis: mockAxis,
        rng: createMockRng(),
        nodePlacementRotation: 0,
        nodeDivergenceLookup: () => Math.PI / 2,
        nodePositions: [0, 0.2, 0.3, 1],
        placementScheme: PlacementScheme.ALTERNATING,
      });

      arrangement.nodes.should.have.length(4);

      const [node1, node2, node3, node4] = arrangement.nodes;

      assertIsClose(node1.direction, vec3.fromValues(0, 0, 1));
      assertIsClose(node2.direction, vec3.fromValues(0, 0, -1));

      assertIsClose(node3.direction, vec3.fromValues(0, 0, 1));
      assertIsClose(node4.direction, vec3.fromValues(0, 0, -1));
    });
  });
});
