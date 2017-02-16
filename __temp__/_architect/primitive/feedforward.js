import R from 'ramda';
import {Layer, NNGraph} from '../internal/layer';
// import {Graph} from '../../architect/ComputationGraph/util/graph';

export class FeedForward extends Layer {
    static abstract = false;

    constructor(layers) {
        if (layers.length === 0)
            throw new TypeError();

        super(R.head(layers).inputShape, R.tail(layers).outputShape);
        const graph = this.graphNode = new Graph(this);

        for (const [from, to] of R.zip(layers.slice(0, -1), layers.slice(1)))
            graph.createConnection(from.graphNode, to.graphNode);
    }

    toJSON() {
        return {...super.toJSON(), ...this.graphNode.nodesAndEdgesToJSON()}
    }
}