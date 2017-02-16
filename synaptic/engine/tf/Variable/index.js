//@flow

import type {Shape, VariableInit as Init} from '../types';
import {Dependency} from '../OperationDependency';


export class Variable {
    static scalar(value: number): Variable {
        return new Variable([], new Float32Array([value]));
    }

    static randomNormal(shape: Shape, {mean = 0.0, stddev = 1.0}: { mean?: number, stddev?: number } = {}) {
        return new Variable(shape, {generator: 'normal', mean, stddev});
    }

    static fill(shape: Shape, {fill}: {fill: number}) {
        return new Variable(shape, {generator: 'fill', fill});
    }

    static randomTruncatedNormal(shape: Shape, {mean = 0.0, stddev = 1.0}: { mean?: number, stddev?: number } = {}) {
        return new Variable(shape, {generator: 'truncatedNormal', mean, stddev});
    }

    static randomUniform(shape: Shape, {min = 0, max = Infinity}: { min?: number, max?: number } = {}) {
        return new Variable(shape, {generator: 'uniform', min, max});
    }

    shape: Shape;
    stateDependency: Dependency = new Dependency(Dependency.nonce);
    pointer = null;
    init: Init;
    name: ?string;

    constructor(shape: Shape, init: Init, name: ?string) {
        if (!shape)
            debugger;
        this.shape = shape;
        this.init = init;
        if (name)
            this.name = name;
    }

    registerManipulation(dependency: Dependency): void {
        this.stateDependency = this.stateDependency.join(dependency);
    }
}