//@flow
import {Layer} from '../topology/Layer';
import type {activationFn} from '../util/ActivationFunctions';
import activationFns from '../util/ActivationFunctions';
import {Matrix} from '../util/Matrix';
import {expect} from 'chai';

export class ActivationLayer extends Layer {
    static activationFns = activationFns;
    activationFn: activationFn;

    constructor(shape: Shape, activation: string | activationFn) {
        super(shape, shape);

        if (!(activation instanceof Object)) {
            const activationFns: {[key: any]: activationFn} = this.constructor.activationFns;
            const activationFn = activationFns[activation];

            if (!activationFn)
                throw new TypeError(`activation ${String(activation)} cannot be found`)


            activation = activationFn;
        }

        this.activationFn = activation;
    }

    activate(input: Activation): Activation {
        expect(input.shape).to.deep.equal(this._inputShape);
        return input.map(this.activationFn.f)
    }

    _propagate(activation: Activations, err: Err, activation_gradient: Gradient): [Deltas, Err, Gradient] {
        if (!(activation instanceof Matrix))
            throw new Error();

        expect(activation.shape).to.deep.equal(this._inputShape);
        expect(err.shape).to.deep.equal(this._outputShape);
        expect(activation_gradient.shape).to.deep.equal(this._outputShape);


        const internal_gradient: Gradient = activation.map(this.activationFn.df);

        // console.log('activation gradient', activation, internal_gradient)

        const gradient: Gradient = activation_gradient
            ? Matrix.product(activation_gradient, internal_gradient)
            : internal_gradient;
        return [
            undefined,
            err,
            gradient
        ]
    }
}