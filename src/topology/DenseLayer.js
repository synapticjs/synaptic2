import {Layer} from './Layer';
import {Matrix} from 'vectorious';

export class DenseLayer extends Layer {
    weights: Matrix;

    constructor(inputShape: number, outputShape: number) {
        super(inputShape, outputShape);

        this.weights = Matrix.random(this.inputShape, this.outputShape, 0, 1).toArray();
        this.weights_delta = Matrix.zeros(this.inputShape, this.outputShape).toArray();
    }

    activate(input) {
        super.activate(input);
        const am = new Matrix([input]);
        const wm = new Matrix(this.weights);
        return am.multiply(wm).toArray()[0];
    }

    propagate(error, derivative) {
        super.propagate();
        const dm = new Matrix([derivative]);
        const em = new Matrix([error]);
        const wm = new Matrix(this.weights);

        const wem = em.multiply(wm.T);
        console.log(wem);
        return this.weights_delta = wem.product(dm);
    }

    recalc(learning_rate = 1) {
        this.weights = new Matrix(this.weights).add(
            this.weights_delta.multiply(new Matrix([this.activationValue])).scale(learning_rate)
        ).toArray();
    }
}