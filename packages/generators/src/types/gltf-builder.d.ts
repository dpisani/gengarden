/* tslint:disable:max-classes-per-file */
declare module 'gltf-builder' {
  class ComponentBuilder {
    public build: () => JSON;
  }

  class NamedComponentBuilder {
    public name: (name: string) => this;
  }

  export class Asset extends ComponentBuilder {
    public addScene: (scene: Scene) => this;
  }

  export class Scene extends NamedComponentBuilder {
    public addNode: (node: Node) => this;
  }

  export class Node extends NamedComponentBuilder {
    public addChild: (child: Node) => this;

    public mesh: (mesh: Mesh) => this;

    public translation: (x: number, y: number, z: number) => this;

    public rotation: (x: number, y: number, z: number, w: number) => this;

    public scale: (x: number, y: number, z: number) => this;

    // public matrix: (matrix: number[] | Float32Array) => this;
  }

  export class Mesh extends ComponentBuilder {
    public addPrimitive: (primitive: Primitive) => this;
  }

  export class Material extends NamedComponentBuilder {
    public doubleSided: (ds: boolean) => this;
  }

  export class Primitive extends ComponentBuilder {
    public material: (material: Material) => this;

    public indices: (indices: Accessor) => this;

    public position: (position: Accessor) => this;

    public texcoord: (texcoord: Accessor, index?: number) => this;
  }

  export class Accessor extends ComponentBuilder {}

  function buildVec2Accessor(data: Array<Float32Array | number[]>): Accessor;

  function buildVec3Accessor(data: Array<Float32Array | number[]>): Accessor;

  function buildUIntAccessor(data: number[]): Accessor;
}
