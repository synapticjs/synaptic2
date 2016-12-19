import {Layer} from './Layer';
import {Matrix} from '../util/Matrix';

export class BiasInputLayer extends Layer {
    constructor(outputShape) {
        super([1,0], outputShape);
    }

    activate(input: Activation): Activation {
        return Matrix.ones(...this._outputShape)
    }

    _log(activation: Activations): string {
        return `${this._logSelf()}`;
    }
}