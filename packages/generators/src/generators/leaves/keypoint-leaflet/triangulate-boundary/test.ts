import { triangulateBoundary } from "./index";
import { vec3 } from "gl-matrix";
import "should";

describe("Boundary triangulator", () => {
  it("turns a list of points into a mesh", () => {
    const boundary = [
      { position: vec3.fromValues(0, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 1) },
    ];

    const res = triangulateBoundary(boundary);

    res.vertices.should.containDeep([
      { position: vec3.fromValues(0, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 1) },
    ]);
    res.polygons.length.should.eql(1);
    res.polygons[0].should.containDeep([0, 1, 2]);
  });

  it("divides complex polygons into triangles", () => {
    const boundary = [
      { position: vec3.fromValues(0, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 1) },
      { position: vec3.fromValues(0, 0, 1) },
    ];

    const res = triangulateBoundary(boundary);

    res.vertices.should.containDeep([
      { position: vec3.fromValues(0, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 1) },
      { position: vec3.fromValues(0, 0, 1) },
    ]);
    res.polygons.length.should.eql(2);
  });

  it("handles degenerate points", () => {
    const boundary = [
      { position: vec3.fromValues(0, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 1) },
      { position: vec3.fromValues(0, 0, 1) },
    ];

    const res = triangulateBoundary(boundary);

    res.vertices.should.have.length(4);
    res.vertices.should.containDeep([
      { position: vec3.fromValues(0, 0, 0) },
      { position: vec3.fromValues(1, 0, 0) },
      { position: vec3.fromValues(1, 0, 1) },
      { position: vec3.fromValues(0, 0, 1) },
    ]);

    res.polygons.length.should.eql(2);
  });
});
