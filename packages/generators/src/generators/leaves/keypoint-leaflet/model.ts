import { Material, MetallicRoughness, Node, TextureInfo } from "gltf-builder";
import { reversePrimitiveWinding } from "../../../spatial-utils/reverse-primitive-winding.ts";
import { generateMesh, PrimitiveBlueprint } from "../../mesh/index.ts";
import { KeypointStemAxisBlueprint } from "../../stem-axis/keypoint-stem-axis/index.ts";
import { generateTubePathFromStemAxis } from "../../tube-path/from-stem-axis.ts";
import {
  KeypointBladeBlueprint,
  KeypointLeafletBlueprint,
} from "./blueprint.ts";
import { triangulateBoundary } from "./triangulate-boundary/index.ts";

export const generateLeafletModel = (
  leaflet: KeypointLeafletBlueprint,
): Node => {
  const stemMesh = generateMesh(
    generateTubePathFromStemAxis(
      KeypointStemAxisBlueprint.fromStemAxisBlueprint(leaflet.stem),
    ),
  );

  const node = new Node().mesh(stemMesh);

  node.addChild(generateLeafBladeModel(leaflet));

  return node;
};

export const generateLeafBladeModel = (
  bladeBp: KeypointBladeBlueprint,
): Node => {
  const node = new Node();

  for (const boundary of bladeBp.bladeBoundaries) {
    const meshBp = triangulateBoundary(boundary);

    if (bladeBp.bladeTexture) {
      const material = new Material().metallicRoughness(
        new MetallicRoughness().baseColorTexture(
          new TextureInfo().texture(bladeBp.bladeTexture),
        ),
      );

      meshBp.material = material;
    }

    // Create models for the top side and underside
    const undersideBp: PrimitiveBlueprint = reversePrimitiveWinding(meshBp);

    return node
      .addChild(new Node().mesh(generateMesh(meshBp)))
      .addChild(new Node().mesh(generateMesh(undersideBp)));
  }

  return node;
};
