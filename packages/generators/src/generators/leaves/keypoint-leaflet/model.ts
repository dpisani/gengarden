import { Node, Mesh } from 'gltf-builder';
import { flatten } from 'lodash';
import { KeypointLeafletBlueprint } from './blueprint';
import { generateAxisTubePathModel } from '../../stem-axis/keypoint-stem-axis/model';
import { KeypointStemAxisBlueprint } from '../../stem-axis/keypoint-stem-axis';
import triangulateBoundary, { MeshBlueprint } from './triangulate-boundary';
import meshGenerator from '../../mesh';

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

const generateLeafBladeModel = (mesh: MeshBlueprint): Node => {
  // Create models for the top side and underside

  const underside = {
    ...mesh,
    polygons: mesh.polygons.map(p => p.slice().reverse()),
  };

  return new Node()
    .addChild(
      new Node().mesh(
        meshGenerator.generate({
          geometry: {
            vertices: mesh.vertices,
            indices: flatten(mesh.polygons),
          },
        }),
      ),
    )
    .addChild(
      new Node().mesh(
        meshGenerator.generate({
          geometry: {
            vertices: underside.vertices,
            indices: flatten(underside.polygons),
          },
        }),
      ),
    );
};
