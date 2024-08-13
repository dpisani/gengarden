import "should";

import { generateTube } from "./index";
import { vec3 } from "gl-matrix";

describe("tube generator", () => {
  it("generates texcoords when texInfo is supplied", () => {
    const tube = generateTube({
      begin: { position: vec3.fromValues(0, 0, 0), width: 1 },
      end: { position: vec3.fromValues(0, 1, 0), width: 1 },
      texInfo: { beginV: 0, endV: 1 },
    });

    for (const v of tube.vertices) {
      v.texcoord &&
        v.texcoord[1].should.equal(
          v.position[1],
          `mismatched texcoord. pos: ${v.position}, uv: ${v.texcoord}`,
        );
    }
  });
});
