import {Layer} from './Layer';
export class OutputLayer extends Layer {
    constructor(size) {
        super(size, size)
    }

    activate(input) {
        super.activate(input)
        return this.activationValue.multiply(this.weights).T;
    }

    propagate(error) {
        super.propagate(error);
        return this.propagationValue;
    }
}