import {Tensor, Num, Pointer} from './types';
import {GraphRecorderAPI} from './core';


export class GraphRecorder extends GraphRecorderAPI {
    //types
    float32matrix([s1, s2]: number[]) { return this._registerPointer(new Tensor('Float32', [s1, s2])) };

    float32() { return this._registerPointer(new Num('Float32')) };

    define(varname, value) { this._varMap[varname].predefine(value); }

    //ops
    read(variable: Pointer) { this._registerOp([this._keywords.read, variable]) }

    write(variable: Pointer) { this._registerOp([this._keywords.write, variable]) }

    //noinspection ReservedWordAsName
    ifnot0(condition: Pointer, truthyFn: Function, falsyFn: Function) {
        this._registerOp([
            this._keywords.if,
            condition,
            this._record(truthyFn),
            this._record(falsyFn),
        ])
    }

    blas = {
        scal: (alpha, x) => this._registerOp(['blas.scal', alpha, x]), //Multiple vector x by scalar alpha
        copy: (x, y) => this._registerOp(['blas.copy', x, y]), //Copy x into y
        axpy: (alpha, x, y) => this._registerOp(['blas.axpy', alpha, x, y]), //Multiple x by alpha and add it to y
        cpsc: (alpha, x, y) => this._registerOp(['blas.cpsc', alpha, x, y]), //Multiply x by alpha and assign it to y
        dot: (x, y) => this._registerOp(['blas.dot', x, y]), //Calculate the inner product of x and y
        gemm: (c, a, b) => this._registerOp(['blas.gemm', c, a, b]) //General matrix multiplication. Set c = a * b
    };
}
