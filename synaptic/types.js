export type Variable = {
    shape: Shape;
    name: ?string;
}

export type Matr4dShape = [number, number, number, number];
export type Matr3dShape = [number, number, number];
export type MatrixShape = [number, number];
export type VectorShape = [number];
export type ScalarShape = [];

export type Shape = Matr4dShape
    | Matr3dShape
    | MatrixShape
    | VectorShape
    | ScalarShape;

type ValueInit = Float32Array;
type FillInit = { generator: 'fill', fill: number };
type RandomNormalInit = { generator: 'normal', mean: number, stddev: number };
type RandomTruncatedNormalInit = { generator: 'truncatedNormal', mean: number, stddev: number };
type RandomUniformInit = { generator: 'uniform', min: number, max: number };

export type VariableInit = ValueInit
    | FillInit
    | RandomNormalInit
    | RandomTruncatedNormalInit
    | RandomUniformInit
    | void;

export type Var = Variable;

export type Scalar = Var & { shape: ScalarShape; }
export type Vector = Var & { shape: VectorShape; }
export type Matrix = Var & { shape: MatrixShape; }
export type Matr3d = Var & { shape: Matr3dShape; }
export type Matr4d = Var & { shape: Matr4dShape; }