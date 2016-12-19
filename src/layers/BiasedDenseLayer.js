import {FeedForwardNetwork} from '../topology/FeedForwardNetwork';
import {Layer} from '../topology/Layer';
import {BiasInputLayer} from '../topology/BiasInputLayer';
import {Parallelize1dLayer} from '../topology/Parallelize1dLayer';
import {DenseLayer} from './DenseLayer';

export class BiasedDenseLayer extends FeedForwardNetwork {
    constructor(inputShape: Shape, outputShape: Shape) {
        super([
            new Parallelize1dLayer([
                new Layer(inputShape, inputShape),
                new BiasInputLayer([inputShape[0],1]),
            ]),
            new DenseLayer([inputShape[0], inputShape[1] + 1], outputShape)
        ])
    }
}