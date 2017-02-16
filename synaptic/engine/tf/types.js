//@flow
//todo detach variable.pointer

import {Variable} from './Variable';
import type {Matr3dShape, Matr4dShape, MatrixShape, ScalarShape, Shape, VariableInit, VectorShape} from '../../types';

export type {Shape, VariableInit} from '../../types';

export type Var = Variable;

export type Scalar = Var & { shape: ScalarShape; }
export type Vector = Var & { shape: VectorShape; }
export type Matrix = Var & { shape: MatrixShape; }
export type Matr3d = Var & { shape: Matr3dShape; }
export type Matr4d = Var & { shape: Matr4dShape; }