//@flow

import {Layer} from './util/layer';
import {operations, Variable} from '../tf';

export class Dense extends Layer<void> {
    static isTrainable = true;

    weights = Variable.randomNormal([this.inputShapes[0][1], this.outputShapes[0][1]]);

    constructor(...args: any[]) {
        super(...args);

        if (this.inputShapes[0][0] !== this.outputShapes[0][0])
            throw new TypeError(`${JSON.stringify(this.inputShapes)}, ${JSON.stringify(this.outputShapes)}`);
    }

    activate([input]: Variable[], [output]: Variable[], [outputDerivative]: Variable[]): void {
        operations.blas.gemm(output, input, this.weights);
    }

    /*we DO NOT expect derivative here, so we're 100% sure derivative is 1*/
    propagate([errorGradient]: Variable[], [outputDerivative]: Variable[], [outputErrorGradient]: Variable[]): void {
        operations.transpose(this.weights);
        operations.blas.gemm(outputErrorGradient, errorGradient, this.weights);
        operations.transpose(this.weights);
    }
}