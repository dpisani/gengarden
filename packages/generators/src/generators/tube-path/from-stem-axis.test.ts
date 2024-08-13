import { KeypointStemAxisBlueprint } from "../stem-axis/keypoint-stem-axis";
import { vec3 } from "gl-matrix";
import { stub } from "sinon";
import { generateTubePathFromStemAxis } from "./from-stem-axis";

describe("stem axis model generator", () => {
  it("generates texture coordinates", () => {
    const bp = new KeypointStemAxisBlueprint([
      { position: vec3.fromValues(0, 0, 0), width: 1 },
      { position: vec3.fromValues(10, 0, 0), width: 1 },
      { position: vec3.fromValues(10, 0, 10), width: 1 },
      { position: vec3.fromValues(10, 0, 15), width: 1 },
    ]);

    const mockGenerateTubePath = stub().returns({ vertices: [] });

    generateTubePathFromStemAxis(bp, {
      generateTubePath: mockGenerateTubePath,
    });

    mockGenerateTubePath.getCalls().should.have.length(1);
    mockGenerateTubePath.firstCall.args[0].segments
      .map((s) => s.texV)
      .should.deepEqual([0, 0.4, 0.8, 1]);
  });
});
