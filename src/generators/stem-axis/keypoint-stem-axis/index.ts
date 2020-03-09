import { StemAxisBlueprint } from '../index';
import { vec3 } from 'gl-matrix';

import { lerp } from '../../util/math';

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
      vec3.scale(vec3.create(), segmentVec, t),
    );

    const width = lerp(segment[0].width, segment[1].width, t);

    return { position: infoPosition, width, axisDirection: segmentDir };
  };
}
