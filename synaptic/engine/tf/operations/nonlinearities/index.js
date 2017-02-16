//@flow
import type {Var, Vector} from '../../types';
import cwise from 'cwise';
import {OperationDependency} from '../../OperationDependency';

export function sigmoid(input: Var, output: Var, outputDerivative: Var): void {
    output.registerManipulation(new OperationDependency(cwise({
        args: ['array', 'array'],
        body: function (input, output) {
            output = 1 / (1 + Math.exp(-input));
        }
    }), Array.from(arguments), 'activation.sigmoid'));

    outputDerivative.registerManipulation(new OperationDependency(cwise({
        args: ['array', 'array'],
        body: function (input, output) {
            output = input / (1 - input);
        }
    }), [output, outputDerivative], 'activation.sigmoid derivative'));
}

export function linear(input: Var, output: Var, outputDerivative: Var): void {
    output.registerManipulation(new OperationDependency(cwise({
        args: ['array', 'array'],
        body: function (input, output) {
            output = input;
        }
    }), Array.from(arguments), 'activation.linear'));

    outputDerivative.registerManipulation(new OperationDependency(cwise({
        args: ['array', 'array'],
        body: function (input, output) {
            output = 0;
        }
    }), [output, outputDerivative], 'activation.linear derivative'));
}