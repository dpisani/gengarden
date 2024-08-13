import * as glMatrix from "gl-matrix";

declare module "gl-matrix" {
  export namespace mat4 {
    /**
     * Generates a matrix that makes something look at something else.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    function targetTo(
      out: mat4,
      eye: vec3 | number[],
      center: vec3 | number[],
      up: vec3 | number[],
    ): mat4;
  }
}
