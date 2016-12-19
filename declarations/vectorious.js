//@flow

declare class Vector {
    constructor (data: number[]): void;

    static add (a: Vector, b: Vector): Vector;

    add (vector: Vector): Vector;

    static subtract (a: Vector, b: Vector): Vector;

    subtract (vector: Vector): Vector;

    static scale (vector: Vector, scalar: number): Vector;

    scale (scalar: number): Vector;

    static normalize (vector: Vector): Vector;

    normalize (): Vector;

    static project (a: Vector, b: Vector): Vector;

    project (vector: Vector): Vector;

    static zeros (count: number, type?: any): Vector;

    static ones (count: number, type?: any): Vector;

    static range (start: number, end: number): Vector;
    static range (start: number, step: number, end: number): Vector;

    static random (count: number, deviation?: number, mean?: number, type?: any): Vector;

    static dot (a: Vector, b: Vector): number;

    dot (vector: Vector): number;

    magnitude (): number;

    static angle (a: Vector, b: Vector): number;

    angle (vector: Vector): number;

    static equals (a: Vector, b: Vector): boolean;

    equals (vector: Vector): boolean;

    get (index: number): number;

    min (): number;

    max (): number;

    set (index: number, value: number): Vector;

    static combine (a: Vector, b: Vector): Vector;

    combine (vector: Vector): Vector;

    push (value: number): Vector;

    map (callback: (element: number) => number): Vector;

    each (callback: (element: number) => void): Vector;

    reduce (callback: (memo: number, element: number) => number, initialValue?: number): number;

    toString (): string;

    toArray (): number[];
}

declare class Matrix {

    T: Matrix;

    shape: [number, number];

    data: Uint32Array;

    constructor (data: number[][], options?: any): void;

    static fromTypedArray (data: any, shape: number[]): Matrix;

    static fromArray (data: number[][]): Matrix;

    static add (a: Matrix, b: Matrix): Matrix;

    add (matrix: Matrix): Matrix;

    static subtract (a: Matrix, b: Matrix): Matrix;

    subtract (matrix: Matrix): Matrix;

    static scale (matrix: Matrix, scalar: number): Matrix;

    scale (scalar: number): Matrix;

    static product (a: Matrix, b: Matrix): Matrix;

    product (matrix: Matrix): Matrix;

    static zeros (i: number, j: number, type?: any): Matrix;

    static ones (i: number, j: number, type?: any): Matrix;


    static random (i: number, j: number, deviation?: number, mean?: number, type?: any): Matrix;


    static multiply (a: Matrix, b: Matrix): Matrix;



    multiply (matrix: Matrix): Matrix;


    transpose (): Matrix;


    inverse (): Matrix;


    gauss (): Matrix;


    lu (): number[];

    static plu (matrix: Matrix): any[];

    plu (): any[];

    lusolve (rhs: Matrix, ipiv: Int32Array): Matrix;

    solve (rhs: Matrix|Vector): Matrix;

    static augment (a: Matrix, b: Matrix): Matrix;

    augment (matrix: Matrix): Matrix;

    static identity (size: number, type?: any): Matrix;

    static magic (size: number, type?: any): Matrix;

    diag (): Vector;

    determinant (): number;

    trace (): number;

    static equals (a: Matrix, b: Matrix): boolean;

    equals (matrix: Matrix): boolean;

    get (i: number, j: number): number;

    set (i: number, j: number, value: number): Matrix;

    swap (i: number, j: number): Matrix;

    map (callback: (element: number) => number): Matrix;

    each (callback: (element: number) => void): Matrix;

    reduce (callback: (memo: number, element: number) => number, initialValue?: number): number;

    rank (): number;

    static rank (matrix: Matrix): number;

    toString (): string;

    toArray (): number[][];
}

declare class BLAS {}