import { Node, Material, MetallicRoughness, TextureInfo } from "gltf-builder";
import { KeypointLeafletBlueprint } from "./blueprint";
import { generateTubePathFromStemAxis } from "../../tube-path/from-stem-axis";
import { KeypointStemAxisBlueprint } from "../../stem-axis/keypoint-stem-axis";
import { triangulateBoundary } from "./triangulate-boundary";
import { generateMesh, PrimitiveBlueprint } from "../../mesh";

export const generateLeafletModel = (
  leaflet: KeypointLeafletBlueprint,
): Node => {
  const stemNode = generateTubePathFromStemAxis(
    KeypointStemAxisBlueprint.fromStemAxisBlueprint(leaflet.stem),
  );

  const node = new Node().addChild(stemNode);

  for (const boundary of leaflet.bladeBoundaries) {
    const meshBp = triangulateBoundary(boundary);

    if (leaflet.bladeTexture) {
      const material = new Material().metallicRoughness(
        new MetallicRoughness().baseColorTexture(
          new TextureInfo().texture(leaflet.bladeTexture),
        ),
      );

      meshBp.material = material;
    }

    node.addChild(generateLeafBladeModel(meshBp));
  }

  return node;
};

const generateLeafBladeModel = (meshBp: PrimitiveBlueprint): Node => {
  // Create models for the top side and underside
  const undersideBp: PrimitiveBlueprint = {
    ...meshBp,
    polygons: meshBp.polygons.map(([a, b, c]) => [c, b, a]),
  };

  return new Node()
    .addChild(new Node().mesh(generateMesh(meshBp)))
    .addChild(new Node().mesh(generateMesh(undersideBp)));
};
