export class Layer {
    inputShape: number;
    outputShape: number;
    activationValue: number[];
    propagationValue: number[];

    constructor(inputShape, outputShape) {
        if (this.constructor === Layer)
            throw new Error('cannot construct Layer directly');

        this.inputShape = inputShape;
        this.outputShape = outputShape;
    }

    activate(input) {
        return this.activationValue = input;
    }

    propagate(error) {
        return this.propagationValue = error;
    }
}