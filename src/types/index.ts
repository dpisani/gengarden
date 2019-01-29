/**
 * A specification for an object,
 * tagged with a 'type' property to remove ambiguity
 */
export interface TaggedSpec<S> {
  type: string;
  spec: S;
}

export interface GeneratorDefinition<S, R> {
  isValidSpec: (ts: TaggedSpec<any>) => ts is TaggedSpec<S>;
  generate: (S) => R;
}

export type PartialSpec<T> = {
  [P in keyof T]: PartialSpec<T[P]> | TaggedSpec<any> | T[P]
};
