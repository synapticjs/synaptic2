//@flow
import type {EdgeType, Optimizer, Shape} from '../../types';
import {Variable, operations} from '../../tf';

type LayerInit = {
    inputShapes: Shape[],
    outputShapes: Shape[],
}

export class Layer<Options: any> {
    static isTrainable = false;
    isTrainable: boolean = this.constructor.isTrainable;

    toEdges: EdgeType[] = [];
    fromEdges: EdgeType[] = [];

    inputShapes: Shape[];
    outputShapes: Shape[];

    options: Options;

    name = this.constructor.name;



    constructor({inputShapes, outputShapes}: LayerInit, options: Options) {
        this.inputShapes = inputShapes;
        this.outputShapes = outputShapes;
        this.options = options;
    }

    activate(inputs: Variable[], outputs: Variable[], outputDerivatives: Variable[]): void {
        throw new Error('this method must be implemented');
    }

    propagate([errorGradient]: Variable[], [outputDerivative]: Variable[], [outputErrorGradient]: Variable[]): void {
        throw new Error('this method must be implemented');
    }

    optimize(optimizer: Optimizer) {
        //basically do nothing if layer is non-trainable
    }
}