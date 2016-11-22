import {DenseLayer} from '../../src/topology/DenseLayer';
import {expect} from 'chai';

describe('Dense layer 2x1', () => {
    let layer = new DenseLayer(2, 1);

    it('should perform forward pass', () => {
        layer.weights = [[1], [2]]

        const input = [5, 6];

        expect(layer.activate(input)).to.deep.equal([
            input[0] * layer.weights[0][0] + input[1] * layer.weights[1][0],
        ])
    })

    it.only('should perform backward pass', () => {
        layer.weights = [[1], [2]]

        const input = [5, 6];

        const output = layer.activate(input);

        const error = output.map(val => -val);

        const delta = layer.propagate(error, [1]);

        expect(delta).to.deep.equal([
            error[0] * input[0],
            error[0] * input[1]
        ])
    })

    it('generate an error on backward pass', () => {
        /* we want layer to increase every weight twice
         *  so we have
         *  1 * 1 + 2 * 2 = 5 expect 10
         *  and
         *  1 * 3 + 2 * 4 = 11 expect 22
         * */
        layer.weights = [
            [1, 3],
            [2, 4]
        ]

        const input = [1, 2];

        const output = layer.activate(input);

        const error = output.map(val => -val);

        const delta = layer.propagate(error);

        expect(delta).to.deep.equal([
            error[0] * input[0] + error[1] * input[1],
            error[1]
        ])
    })
})
describe('Dense layer 2x2', () => {
    let layer;
    beforeEach(() => layer = new DenseLayer(2, 2))
    it('should perform forward pass', () => {
        layer.weights = [
            [1, 2],
            [3, 4]
        ]

        const input = [5, 6];

        expect(layer.activate(input)).to.deep.equal([
            input[0] * layer.weights[0][0] + input[1] * layer.weights[1][0],
            input[0] * layer.weights[0][1] + input[1] * layer.weights[1][1],
        ])
    })

    it('should perform backward pass', () => {
        /* we want layer to increase every weight twice
         *  so we have
         *  1 * 1 + 2 * 2 = 5 expect 10
         *  and
         *  1 * 3 + 2 * 4 = 11 expect 22
         * */
        layer.weights = [
            [1, 3],
            [2, 4]
        ]

        const input = [1, 2];

        const output = layer.activate(input);

        const error = output.map(val => -val);

        const delta = layer.propagate(error);

        expect(delta).to.deep.equal([
            error[0] * input[0] + error[1] * input[1],
            error[1]
        ])
    })

    it('generate an error on backward pass', () => {
        /* we want layer to increase every weight twice
         *  so we have
         *  1 * 1 + 2 * 2 = 5 expect 10
         *  and
         *  1 * 3 + 2 * 4 = 11 expect 22
         * */
        layer.weights = [
            [1, 3],
            [2, 4]
        ]

        const input = [1, 2];

        const output = layer.activate(input);

        const error = output.map(val => -val);

        const delta = layer.propagate(error);

        expect(delta).to.deep.equal([
            error[0] * input[0] + error[1] * input[1],
            error[1]
        ])
    })
})