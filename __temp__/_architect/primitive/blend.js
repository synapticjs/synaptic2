import R from 'ramda';
import {Layer} from '../internal/layer';
// import {Graph, Node} from '../../architect/ComputationGraph/util/graph';
/*
 Blend layer, not to be confused with various Merge layers.
 Blends programmatically-generating layers into passthru data
 */
export class Blend extends Layer {
    constructor(inputShape, layers, merge_dim = 0) {
        const expectedShape = [inputShape.split(0, merge_dim), inputShape.split(merge_dim + 1)]
        const shapes = layers
            .map(layer => layer.outputShape)
            .map(shape => [shape.split(0, merge_dim), shape.split(merge_dim + 1)]);
        if (shapes.some(shape => !R.equals(expectedShape)))
        /*todo extend test message*/
            throw new TypeError('shapes are not compatible!')

        const outputDim = [
            inputShape[merge_dim],
            ...layers.map(layer => layer.outputShape[merge_dim])
        ]
            .reduce((a, b) => a + b);

        const outputShape = [...expectedShape[0], outputDim, ...expectedShape[1]];
        super(inputShape, outputShape);

        const graph = this.graphNode = new Graph(this);

        const to = new Node(this);

        for (const [from, to] of R.zip(layers.slice(0, -1), layers.slice(1)))
            graph.createConnection(from.graphNode, to.graphNode);
    }
}