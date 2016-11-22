import R from 'ramda';
import {Layer} from './Layer';

export class Network extends Layer {
    chain: Layer[];

    constructor(chain) {
        super(chain[0].inputShape, chain[chain.length - 1].outputShape);
        this.chain = chain;
    }

    activate(input) {
        let activationValue = input;
        for (const layer of this.chain)
            activationValue = layer.activate(activationValue);

        return super.activate(activationValue);
    }

    propagate(error) {
        super.propagate(error);
        let propagationValue = this.propagationValue;

        for (const layer of R.reverse(this.chain))
            propagationValue = layer.propagate(propagationValue);

        return super.propagate(propagationValue);
    }
}