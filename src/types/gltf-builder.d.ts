declare module 'gltf-builder' {
  class ComponentBuilder {
    [setter: string]: (...any) => any;
    build: () => object;
  }

  export class Node extends ComponentBuilder {}
  export class Mesh extends ComponentBuilder {}
  export class Primitive extends ComponentBuilder {}
  export class Scene extends ComponentBuilder {}
  export class Asset extends ComponentBuilder {}
  export class Accessor extends ComponentBuilder {}

  export function buildPosition(any): Accessor;
  export function buildIndices(any): Accessor;
}
