export interface TaggedSpec {
  type: string;
  spec: any;
}

export interface GeneratorDefinition<T extends TaggedSpec, R> {
  isValidSpec: (TaggedSpec) => TaggedSpec is T;
  generate: (T) => R;
}
