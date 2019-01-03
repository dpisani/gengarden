export interface TaggedSpec {
  type: string;
  spec: any;
}

export interface GeneratorDefinition<T extends TaggedSpec> {
  isValidSpec: (TaggedSpec) => TaggedSpec is T;
  generate: (T) => any;
}
