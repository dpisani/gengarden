import { mat4, vec3 } from 'gl-matrix';

import { zip } from 'lodash';
import { generateTube as generateTubeDI } from '../tube';
import createRing from '../util/create-ring';
import { MeshBlueprint, PrimitiveBlueprint } from '../mesh';

interface PathSegment {
  position: vec3;
  width: number;
  texV?: number;
}

interface TubePathSpec {
  segments: PathSegment[];
}

export interface InjectedDependencies {
  generateTube?: typeof generateTubeDI;
}

const validateSpec = (
  spec: TubePathSpec,
): { messages: string[]; isValid: boolean } => {
  const messages: string[] = [];
  const numTexV = spec.segments.reduce(
    (count, segment) => (segment.texV !== undefined ? count + 1 : count),
    0,
  );

  if (numTexV !== spec.segments.length && numTexV !== 0) {
    messages.push('texV must be specified on all segments');
  }

  return { messages, isValid: messages.length === 0 };
};

export function generateTubePath(
  spec: TubePathSpec & InjectedDependencies,
): MeshBlueprint {
  const validation = validateSpec(spec);
  if (!validation.isValid) {
    throw new Error(validation.messages.join('\n'));
  }

  const { generateTube = generateTubeDI } = spec;

  const primitives: PrimitiveBlueprint[] = [];

  const ringNormals: vec3[] = [];
  for (let i = 1; i < spec.segments.length; i++) {
    const s1 = spec.segments[i - 1];
    const s2 = spec.segments[i];

    const normal = vec3.create();
    vec3.sub(normal, s2.position, s1.position);

    ringNormals[i] = normal;
  }
  // since we can't know which way the first segment came from
  // just re use the second normal
  ringNormals[0] = ringNormals[1];

  const ringProto = createRing({ plane: 'xy' });

  const rings: vec3[][] = zip(ringNormals, spec.segments).map(
    ([n, segment]) => {
      if (!n || !segment) {
        throw new Error('Missing segment data');
      }
      const transform = mat4.create();

      const up = vec3.equals(
        vec3.normalize(vec3.create(), n),
        vec3.fromValues(0, 0, 1),
      )
        ? vec3.fromValues(0, 1, 0)
        : vec3.fromValues(0, 0.1, 0.9);

      mat4.targetTo(transform, vec3.create(), n, up);

      return ringProto.map(v =>
        vec3.add(
          vec3.create(),
          vec3.scale(
            vec3.create(),
            vec3.transformMat4(vec3.create(), v, transform),
            segment.width,
          ),
          segment.position,
        ),
      );
    },
  );

  for (let i = 0; i < spec.segments.length - 1; i++) {
    const r1 = rings[i];
    const r2 = rings[i + 1];

    let texInfo;
    if (
      spec.segments[i].texV !== undefined &&
      spec.segments[i + 1].texV !== undefined
    ) {
      texInfo = {
        beginV: spec.segments[i].texV,
        endV: spec.segments[i + 1].texV,
      };
    }

    primitives.push(
      generateTube({
        begin: r1,
        end: r2,
        texInfo,
      }),
    );
  }

  return {
    primitives: primitives,
  };
}
