import { StemAxisBlueprint } from "../index.ts";
import { vec3 } from "gl-matrix";

import { lerp, sampleInterval } from "../../util/math.ts";

interface KeyPoint {
  position: vec3;
  width: number;
}

// Uses a series of keypoints to define the curve of the branch
export class KeypointStemAxisBlueprint implements StemAxisBlueprint {
  readonly keyPoints: KeyPoint[];
  readonly length: number;

  constructor(keypoints: KeyPoint[]) {
    this.keyPoints = keypoints;

    let length = 0;
    for (let i = 1; i < this.keyPoints.length; i++) {
      const segmentDistance = vec3.length(
        vec3.sub(
          vec3.create(),
          this.keyPoints[i - 1].position,
          this.keyPoints[i].position,
        ),
      );

      length += segmentDistance;
    }

    this.length = length;
  }

  /**
   * Returns info about the stem at a given point along the axis
   * @param position A number in the range [0,1] determining how far along the stem to sample
   */
  public getAxisInfoAt = (
    position: number,
  ): {
    position: vec3;
    width: number;
    // the forward direction along the axis from this point
    axisDirection: vec3;
  } => {
    if (position < 0 || position > 1) {
      throw new Error(
        `Position must be in the range [0,1]. Instead got ${position}`,
      );
    }

    const length = this.length * position;

    // get last keypoint before branching point
    let prevKeypoint = {
      lastIdx: 0,
      totalLength: 0,
    };
    for (let i = 0; i < this.keyPoints.length; i++) {
      const segmentDistance = vec3.length(
        vec3.sub(
          vec3.create(),
          this.keyPoints[prevKeypoint.lastIdx].position,
          this.keyPoints[i].position,
        ),
      );

      const totalLength = prevKeypoint.totalLength + segmentDistance;
      if (totalLength >= length) {
        break;
      }

      prevKeypoint = {
        lastIdx: i,
        totalLength,
      };
    }

    // get segment we are interested in
    let segment: [KeyPoint, KeyPoint];
    let t: number;

    if (prevKeypoint.lastIdx === this.keyPoints.length - 1) {
      segment = [
        this.keyPoints[prevKeypoint.lastIdx - 1],
        this.keyPoints[prevKeypoint.lastIdx],
      ];
      t = 1;
    } else {
      segment = [
        this.keyPoints[prevKeypoint.lastIdx],
        this.keyPoints[prevKeypoint.lastIdx + 1],
      ];
      t = length - prevKeypoint.totalLength;
    }

    const segmentVec = vec3.sub(
      vec3.create(),
      segment[1].position,
      segment[0].position,
    );

    const segmentDir = vec3.normalize(vec3.create(), segmentVec);

    const infoPosition = vec3.add(
      vec3.create(),
      this.keyPoints[prevKeypoint.lastIdx].position,
      vec3.scale(vec3.create(), segmentDir, t),
    );

    const width = lerp(segment[0].width, segment[1].width, t);

    return { position: infoPosition, width, axisDirection: segmentDir };
  };

  // Returns the position along the axis ([0,1]) at a given segment point
  public getBranchPositionAtSegment(index: number): number {
    let length = 0;
    for (let i = 1; i <= index; i++) {
      const segmentDistance = vec3.length(
        vec3.sub(
          vec3.create(),
          this.keyPoints[i].position,
          this.keyPoints[i - 1].position,
        ),
      );

      length += segmentDistance;
    }

    return length / this.length;
  }

  /**
   *Converts a generic stem axis blueprint into a keypointed one
   *
   * @static
   * @param {StemAxisBlueprint} axis
   * @param {number} keypoints
   * @returns {KeypointStemAxisBlueprint}
   * @memberof KeypointStemAxisBlueprint
   */
  static fromStemAxisBlueprint(
    axis: StemAxisBlueprint,
    keypoints?: number,
  ): KeypointStemAxisBlueprint {
    if (axis instanceof KeypointStemAxisBlueprint) {
      return axis;
    }

    const noKeypoints = keypoints || 10;
    const positions = sampleInterval(0, 1, noKeypoints);

    const kps = positions
      .map((p) => axis.getAxisInfoAt(p))
      .map(({ position, width }) => ({ position, width }));

    return new KeypointStemAxisBlueprint(kps);
  }
}
