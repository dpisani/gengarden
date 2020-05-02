import { Node, Mesh } from 'gltf-builder';
import { flatten } from 'lodash';
import { KeypointLeafletBlueprint } from './blueprint';
import { generateAxisTubePathModel } from '../../stem-axis/keypoint-stem-axis/model';
import { KeypointStemAxisBlueprint } from '../../stem-axis/keypoint-stem-axis';
import triangulateBoundary from './triangulate-boundary';
import { generateMesh, MeshBlueprint } from '../../mesh';

export default (leaflet: KeypointLeafletBlueprint): Node => {
  const stemNode = generateAxisTubePathModel(
    KeypointStemAxisBlueprint.fromStemAxisBlueprint(leaflet.stem),
  );

  const node = new Node().addChild(stemNode);

  for (let boundary of leaflet.bladeBoundaries) {
    const meshBp = triangulateBoundary(boundary);
    node.addChild(generateLeafBladeModel(meshBp));
  }

  return node;
};

const generateLeafBladeModel = (meshBp: MeshBlueprint): Node => {
  // Create models for the top side and underside

  const undersideBp: MeshBlueprint = {
    ...meshBp,
    polygons: meshBp.polygons.map(([a, b, c]) => [c, b, a]),
  };

  return new Node()
    .addChild(new Node().mesh(generateMesh(meshBp)))
    .addChild(new Node().mesh(generateMesh(undersideBp)));
};
