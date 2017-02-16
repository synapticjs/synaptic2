//@flow
import {createOperationsSequence, TransitionOperation, FullfillnessOperation} from './createOperationsSequence';
import * as layers from '../../layers';
import {Graph} from '../../Graph';
import type {EdgeType, NodeType} from '../../types';
import {expect} from 'chai';

describe('createOperationSequence function', () => {
    it('should properly create operations sequence (keeping multiple inputs in mind)', async() => {
        const bias = new layers.Bias({inputShapes: [], outputShapes: [[1, 1]]})
        const input = new layers.Input({inputShapes: [], outputShapes: [[1, 10]]});
        const merge1 = new layers.Merge1d({inputShapes: [[1, 10], [1, 1]], outputShapes: [[1, 10 + 1]]})
        const output = new layers.Output({inputShapes: [[1, 11]], outputShapes: []});

        const model = new Graph();

        const im_edge = await model.connect(input, merge1, {input: 0, output: 0});
        const bm_edge = await model.connect(bias, merge1, {input: 1, output: 0});
        const mo_edge = await model.connect(merge1, output, {input: 0, output: 0});

        const forwardOperations = createOperationsSequence(model.startNodes, {
            getNodeEdges: (node: NodeType) => ({in: node.fromEdges, out: node.toEdges}),
            getEdgeNodes: (edge: EdgeType) => ({in: edge.fromNode, out: edge.toNode})
        });

        expect(forwardOperations).to.have.length(4 /*layer count*/ + 3/*edge count*/)

        expect(forwardOperations[0]).to.be.instanceOf(FullfillnessOperation)
        expect(forwardOperations[0].params).to.deep.equal({node: input})

        expect(forwardOperations[1]).to.be.instanceOf(FullfillnessOperation)
        expect(forwardOperations[1].params).to.deep.equal({node: bias})


        expect(forwardOperations[2]).to.be.instanceOf(TransitionOperation)
        expect(forwardOperations[2].params).to.deep.equal({edge: im_edge, from: input, to: merge1})

        expect(forwardOperations[3]).to.be.instanceOf(TransitionOperation)
        expect(forwardOperations[3].params).to.deep.equal({edge: bm_edge, from: bias, to: merge1})

        expect(forwardOperations[4]).to.be.instanceOf(FullfillnessOperation)
        expect(forwardOperations[4].params).to.deep.equal({node: merge1})

        expect(forwardOperations[5]).to.be.instanceOf(TransitionOperation)
        expect(forwardOperations[5].params).to.deep.equal({edge: mo_edge, from: merge1, to: output})

        expect(forwardOperations[6]).to.be.instanceOf(FullfillnessOperation)
        expect(forwardOperations[6].params).to.deep.equal({node: output})
    })
})