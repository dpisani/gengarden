import "should";
import { stub } from "sinon";

import { generateTubePath } from "./index.ts";
import { vec3 } from "gl-matrix";

describe("tube path generator", () => {
  it("applies texcoords on each segment", () => {
    const mockGenerateTube = stub().returns({ vertices: [], polygons: [] });
    generateTubePath({
      segments: [
        {
          position: vec3.fromValues(0, 0, 0),
          width: 1,
          texV: 0,
        },
        { position: vec3.fromValues(0, 1, 0), width: 1, texV: 0.5 },
        { position: vec3.fromValues(0, 2, 0), width: 1, texV: 1 },
      ],
      generateTube: mockGenerateTube,
    });

    mockGenerateTube.getCalls().should.have.length(2);
    mockGenerateTube.firstCall.args[0].texInfo.should.deepEqual({
      beginV: 0,
      endV: 0.5,
    });
    mockGenerateTube.secondCall.args[0].texInfo.should.deepEqual({
      beginV: 0.5,
      endV: 1,
    });
  });
});
