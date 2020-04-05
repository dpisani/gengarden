import { Node } from 'gltf-builder';
import { KeypointStemAxisBlueprint } from './index';

import { generate as generateTubePath } from '../../tube-path';

export const generateAxisTubePathModel = (
  axis: KeypointStemAxisBlueprint,
): Node => {
  const tubePath = generateTubePath({
    segments: axis.keyPoints,
  });

  return tubePath;
};
