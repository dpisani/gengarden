import { ArgTypes, Meta } from "@storybook/html";
import { Asset, Node, Scene } from "gltf-builder";

export type GLTFStoryArgs<ExtraArgs extends Record<string, any> = {}> = {
  showGuideBox: boolean;
  guideBoxSize: [number, number, number];
  showBasePlane: boolean;
  cameraPosition: [number, number, number];
} & ExtraArgs;

export const defaultGLTFStoryArgs: GLTFStoryArgs = {
  cameraPosition: [0, 1.6, 2],
  showBasePlane: true,
  showGuideBox: false,
  guideBoxSize: [1, 1, 1],
};

export const gltfStoryArgTypes: ArgTypes<GLTFStoryArgs> = {
  cameraPosition: {
    control: { type: "object" },
  },
  showGuideBox: { control: { type: "boolean" } },
  guideBoxSize: { control: { type: "object" } },
  showBasePlane: { control: { type: "boolean" } },
};

export const defaultGLTFStoryMeta: Meta<GLTFStoryArgs> = {
  args: defaultGLTFStoryArgs,
  argTypes: gltfStoryArgTypes,
};

export const renderGltfStory =
  (
    generatedModel: Promise<Node> | Node,
  ): ((args: GLTFStoryArgs) => HTMLElement) =>
  ({
    showGuideBox,
    guideBoxSize,
    showBasePlane,
    cameraPosition,
  }: GLTFStoryArgs) => {
    const element = document.createElement("div");

    Promise.resolve(generatedModel).then((generatedNode) => {
      const gltfAsset = new Asset()
        .addScene(new Scene().addNode(generatedNode))
        .build();

      const gltfContent = new TextEncoder().encode(JSON.stringify(gltfAsset));
      const fileBlob = new Blob([gltfContent], {
        type: "application/json;charset=utf-8",
      });
      const uri = URL.createObjectURL(fileBlob);

      const clone = document
        .querySelector<HTMLTemplateElement>("template#scene")
        ?.content.cloneNode(true) as HTMLElement | undefined;

      if (!clone) {
        throw new Error("Template not in the dome!");
      }

      // Set the asset URL to the generated one
      clone.querySelector("a-asset-item#model")?.setAttribute("src", uri);

      const scene = clone.querySelector("a-scene");

      // Set camera
      const [x, y, z] = cameraPosition;

      const camera = scene?.querySelector("#camera");
      camera?.setAttribute(
        "orbit-controls",
        `autoRotate: false; autoRotateSpeed: 0.7; target: 0 0 0; minDistance: 0.5; maxDistance: 180; initialPosition: ${x} ${y} ${z}`,
      );

      clone
        ?.querySelector("a-plane#base-plane")
        ?.setAttribute("visible", `${showBasePlane}`);

      if (showGuideBox) {
        const guideBox = document.createElement("a-box");
        const [width, height, depth] = guideBoxSize;
        guideBox.setAttribute("width", `${width}`);
        guideBox.setAttribute("depth", `${depth}`);
        guideBox.setAttribute("height", `${height}`);
        guideBox.setAttribute("position", `0 ${height / 2} 0`);
        guideBox.setAttribute(
          "material",
          "color: turquoise; transparent: true; opacity: 0.5; flatShading: true",
        );

        scene?.appendChild(guideBox);
      }

      scene
        ?.querySelector("a-entity#model")
        ?.setAttribute(
          "animation",
          "property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear; resumeEvents: mouseleave; pauseEvents: mouseenter",
        );

      element.appendChild(clone);
    });

    return element;
  };
