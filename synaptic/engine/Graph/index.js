//@flow
import type {EdgeType, NodeType, Shape} from '../types';

import {equals} from 'ramda';

export class Edge {
    fromNode: NodeType;
    toNode: NodeType;
    shape: Shape;
    input: number;
    output: number;

    constructor(fromNode: NodeType, toNode: NodeType, {input, output}: { input: number, output: number }) {
        const incomingShape = fromNode.outputShapes[output];
        const outcomingShape = toNode.inputShapes[input];

        if (!incomingShape || !outcomingShape || !equals(incomingShape, outcomingShape))
            throw new TypeError();

        this.input = input;
        this.output = output;

        this.fromNode = fromNode;
        this.toNode = toNode;

        this.shape = incomingShape;
    }
}

export class Graph {
    allNodes: Set<NodeType> = new Set();
    notStartNodes: Set<NodeType> = new Set();
    notEndNodes: Set<NodeType> = new Set();

    get startNodes(): Set<NodeType> {
        return new Set(Array.from(this.allNodes).filter(node => !this.notStartNodes.has(node)))
    }

    get endNodes(): Set<NodeType> {
        return new Set(Array.from(this.allNodes).filter(node => !this.notEndNodes.has(node)))
    }

    async connect(fromNode: NodeType, toNode: NodeType, params: { input: number, output: number }): Promise<EdgeType> {
        const edge = new Edge(fromNode, toNode, params)

        fromNode.toEdges.push(edge);
        toNode.fromEdges.push(edge);

        this.allNodes.add(toNode);
        this.allNodes.add(fromNode);

        this.notStartNodes.add(toNode);
        this.notEndNodes.add(fromNode);

        return edge;
    }
}
