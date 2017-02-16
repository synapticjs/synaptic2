//@flow

import {Variable as Var} from '../Variable';
import {Dependency, OperationDependency} from '../OperationDependency';
import ndarray from 'ndarray';
import * as R from 'ramda';

const lengthFromShape = shape => shape.reduce((a, b) => a * b, 1);
const ndarrayFromShape = shape => ndarray(new Float32Array(lengthFromShape(shape)), shape);

export class Session {
    runner: () => {};

    constructor() {}

    async compile(resultingVariables: Var[]): Promise<void> {
        const runner = new OperationDependency(Dependency.nonce, resultingVariables);

        const variables = OperationDependency.extractVariables(runner);

        for (const variable of variables) if (!variable.pointer) {
            if (!variable.init) {
                variable.pointer = ndarrayFromShape(variable.shape);
            } else if (variable.init instanceof Float32Array) {
                variable.pointer = ndarray(variable.init, variable.shape);
            } else {
                switch (variable.init.generator) {
                    case 'fill':
                        variable.pointer = ndarray(
                            new Float32Array(lengthFromShape(variable.shape)).fill(variable.init.fill),
                            variable.shape
                        )
                        break;
                    case 'normal':
                        variable.pointer = ndarray(
                            new Float32Array(R.range(0, lengthFromShape(variable.shape))
                                .map(() => (Math.random() - .5) * 2 * variable.init.stddev + variable.init.mean)),
                            variable.shape);
                        break;
                    default:
                        console.warn('bad var init', variable);
                        throw new Error();
                }
            }
        }

        this.runner = runner.compile();
    }

    async write(values: Array<[Var, Float32Array]>): Promise<void> {
        for (const [v, value] of values) {
            if (!v.pointer) {
                console.error(v);
                throw new Error('no pointer is presented');
            }
            v.pointer.data = value;
        }
    }

    async read(variables: Var[]): Promise<Float32Array[]> {
        const res = [];
        for (const v of variables) {
            if (!v.pointer)
                throw new Error();
            res.push(v.pointer.data);
        }
        return res;
    }

    async run(): Promise<void> {
        if (!this.runner)
            throw new Error();

        await this.runner();
    }
}