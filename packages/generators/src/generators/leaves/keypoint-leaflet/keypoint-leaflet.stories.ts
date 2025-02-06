import { Meta, StoryObj } from "@storybook/html";
import Bezier from "bezier-js";
import { mat4, vec3 } from "gl-matrix";
import { Node } from "gltf-builder";
import { UP_VECTOR } from "../../../spatial-utils/vector-util.ts";
import {
  GLTFStoryArgs,
  renderGltfStory,
} from "../../../storybook/render-gltf-story.ts";
import { generateMesh } from "../../mesh/index.ts";
import { generateTube, generateTubeSpecFromPoints } from "../../tube/index.ts";
import { NormalisedCurve } from "../../util/curves.ts";
import {
  BezierLeafBladeSpec,
  generateLeafBladeBoundaryFromCurve,
} from "./generators/bezier-blade.ts";
import {
  SimpleLeafBladeSpec,
  generateSimpleLeafBladeBoundary,
} from "./generators/simple-blade.ts";
import {
  SimpleLeafletBlueprintGeneratorSpec,
  generateSimpleLeafletBlueprint,
} from "./generators/simple-leaflet.ts";
import { generateLeafBladeModel, generateLeafletModel } from "./model.ts";

const meta: Meta<GLTFStoryArgs<{}>> = {
  args: {
    showBasePlane: false,
    cameraPosition: [0, 1, 0.5],
  },
};

export default meta;

export const SimpleLeaflet: StoryObj<
  GLTFStoryArgs<SimpleLeafletBlueprintGeneratorSpec>
> = {
  args: {
    stemLength: 0.07,
    stemWidth: 0.01,
    leafletLength: 0.5,
    leafletWidth: 0.2,
    leafletMidpointPosition: 0.5,
  },
  argTypes: {
    stemLength: { control: { step: 0.1 } },
    stemWidth: { control: { step: 0.01 } },
    leafletLength: { control: { step: 0.1 } },
    leafletWidth: { control: { step: 0.1 } },
    leafletMidpointPosition: { control: { step: 0.1 } },
  },
  render: (args) =>
    renderGltfStory(generateLeafletModel(generateSimpleLeafletBlueprint(args)))(
      args,
    ),
};

export const SimpleBlade: StoryObj<GLTFStoryArgs<SimpleLeafBladeSpec>> = {
  args: {
    length: 0.5,
    width: 0.2,
    midpoint: 0.5,
  },
  argTypes: {
    length: { control: { step: 0.1 } },
    width: { control: { step: 0.01 } },
    midpoint: { control: { step: 0.1 } },
  },
  render: (args) => {
    const boundary = generateSimpleLeafBladeBoundary(args);
    const model = generateLeafBladeModel({ bladeBoundaries: [boundary] });
    return renderGltfStory(model)(args);
  },
};

export const BezierBlade: StoryObj<
  GLTFStoryArgs<
    Omit<BezierLeafBladeSpec, "curve"> & {
      p1: BezierJs.Point;
      p2: BezierJs.Point;
      p3: BezierJs.Point;
      p4: BezierJs.Point;
    }
  >
> = {
  args: {
    length: 0.5,
    width: 0.2,
    p1: { x: 0, y: 0 },
    p2: { x: 0, y: 0.7 },
    p3: { x: 1.5, y: 0.2 },
    p4: { x: 2, y: 0 },
  },
  argTypes: {
    length: { control: { step: 0.1 } },
    width: { control: { step: 0.01 } },
  },
  render: (args) => {
    const curve = new NormalisedCurve(
      new Bezier(args.p1, args.p2, args.p3, args.p4),
    );

    const boundary = generateLeafBladeBoundaryFromCurve({ ...args, curve });
    const model = generateLeafBladeModel({ bladeBoundaries: [boundary] });
    return renderGltfStory(model)(args);
  },
};

export const withTargetTo: StoryObj<GLTFStoryArgs<{ targetTo: vec3 }>> = {
  args: { targetTo: [0, 0, 1] },
  render: (args) => {
    const leafModel = generateLeafletModel(
      generateSimpleLeafletBlueprint({
        stemLength: 0.07,
        stemWidth: 0.01,
        leafletLength: 0.5,
        leafletWidth: 0.2,
        leafletMidpointPosition: 0.5,
      }),
    );

    const targetToMat = mat4.targetTo(
      mat4.create(),
      vec3.create(),
      args.targetTo,
      UP_VECTOR,
    );
    leafModel.matrix(targetToMat);

    const targetMarkerSpec = generateTubeSpecFromPoints({
      begin: { position: [0, 0, 0], width: 0.005 },
      end: {
        position: vec3.scale(vec3.create(), args.targetTo, 10),
        width: 0.005,
      },
    });

    const markerModel = new Node().mesh(
      generateMesh(generateTube(targetMarkerSpec)),
    );

    const model = new Node().addChild(leafModel).addChild(markerModel);
    leafModel.addChild(markerModel);

    return renderGltfStory(model)(args);
  },
};
