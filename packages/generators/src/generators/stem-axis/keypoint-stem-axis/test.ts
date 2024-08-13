import { KeypointStemAxisBlueprint } from "./index";
import { vec3 } from "gl-matrix";

import "should";

describe("Keypoint based stem axis blueprint", () => {
  const bp = new KeypointStemAxisBlueprint([
    { position: vec3.fromValues(0, 0, 0), width: 1 },
    { position: vec3.fromValues(10, 0, 0), width: 1 },
    { position: vec3.fromValues(10, 0, 10), width: 1 },
  ]);

  it("evaluates length to be the sum of all segment lengths", () => {
    bp.length.should.eql(20);
  });

  it("retrieves axis info at given positions", () => {
    bp.getAxisInfoAt(0).position.should.deepEqual(vec3.fromValues(0, 0, 0));
    bp.getAxisInfoAt(0.25).position.should.deepEqual(vec3.fromValues(5, 0, 0));
    bp.getAxisInfoAt(0.5).position.should.deepEqual(vec3.fromValues(10, 0, 0));
    bp.getAxisInfoAt(0.75).position.should.deepEqual(vec3.fromValues(10, 0, 5));
    bp.getAxisInfoAt(1).position.should.deepEqual(vec3.fromValues(10, 0, 10));
  });
});
