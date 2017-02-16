import type {EdgeType, NodeType, OperationsSequence} from '../../types';

type Init = {
    getNodeEdges: (node: NodeType) => {
        in: EdgeType[],
        out: EdgeType[]
    },
    getEdgeNodes: (edge: EdgeType) =>  {
        in: NodeType,
        out: NodeType
    }
}

type OperationType = 'transition' | 'fullfillness';

class Operation {
    type: OperationType = this.constructor.type;

    constructor(params) {
        this.params = params;
    }
}

/*only for tests*/
export class TransitionOperation extends Operation {
    static type = 'transition';
    params: {
        from: NodeType;
        to: NodeType;
        edge: EdgeType;
    }
}
/*only for tests*/
export class FullfillnessOperation extends Operation {
    static type = 'fullfillness';
    params: {
        node: NodeType;
    }
}

//todo: deadlock detection. now code this will go into infinite loop in case of deadlock
export function createOperationsSequence(startNodes, {getNodeEdges, getEdgeNodes}: Init): OperationsSequence {
    const nodes = new Set(startNodes);

    return Array.from(function*() {
        //noinspection JSMismatchedCollectionQueryUpdate
        const nodeProvidedData: Set<NodeType> = new Set();

        while (nodes.size > 0)
            for (const node of nodes) {
                const nodeEdges = getNodeEdges(node)
                const inputs = nodeEdges.in
                    .map(getEdgeNodes)
                    .map(nodes => nodes.in);

                const everyInputHasProvidedData = inputs
                    .every(node => nodeProvidedData.has(node));

                if (everyInputHasProvidedData) {
                    nodes.delete(node);
                    nodeProvidedData.add(node);

                    for (const edge of nodeEdges.in) {
                        const nodes = getEdgeNodes(edge);

                        yield new TransitionOperation({
                            edge,
                            from: nodes.in,
                            to: nodes.out
                        });
                    }

                    yield new FullfillnessOperation({node: node})


                    const availableNodes = nodeEdges.out
                        .map(getEdgeNodes)
                        .map(nodes => nodes.out);

                    for (const node of availableNodes)
                        nodes.add(node);
                }
            }
    }())
}