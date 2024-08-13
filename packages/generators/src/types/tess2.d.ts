declare module "tess2" {
  type V3 = [number, number, number | 0];

  export enum WINDING {
    ODD = 0,
    NONZERO = 1,
    POSITIVE = 2,
    NEGATIVE = 3,
    ABS_GEQ_TWO = 4,
  }
  export enum ELEMENT {
    POLYGONS = 0,
    CONNECTED_POLYGONS = 1,
    BOUNDARY_CONTOURS = 2,
  }

  export interface IOptions {
    windingRule?: number;
    elementType?: number;
    polySize?: number;
    vertexSize?: 2 | 3;
    normal?: V3;
    contours: Array<Array<number>>;
    strict?: boolean;
    debug?: boolean;
  }
  export interface IResult {
    vertices: Array<number>;
    vertexIndices: Array<number>;
    vertexCount: number;
    elements: Array<number>;
    elementCount: number;
    mesh: any;
  }
  export function tesselate({
    windingRule,
    elementType,
    polySize,
    vertexSize,
    normal,
    contours,
    strict,
    debug,
  }: IOptions): IResult | undefined;
  export const WINDING_ODD = WINDING.ODD;
  export const WINDING_NONZERO = WINDING.NONZERO;
  export const WINDING_POSITIVE = WINDING.POSITIVE;
  export const WINDING_NEGATIVE = WINDING.NEGATIVE;
  export const WINDING_ABS_GEQ_TWO = WINDING.ABS_GEQ_TWO;
  export const POLYGONS = ELEMENT.POLYGONS;
  export const CONNECTED_POLYGONS = ELEMENT.CONNECTED_POLYGONS;
  export const BOUNDARY_CONTOURS = ELEMENT.BOUNDARY_CONTOURS;
}
