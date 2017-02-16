//@flow

/*

 So, what is the trick and why all of computations are used instead of small part?

 Thing is that 'tf' module is slightly crazy, super-lazy and mega-optimizable.
 You define the function call graph, where each function call depends on fn call of all prev states.
 Then you take only the variables you need and you say:
 "hey, I want to create a function of all of operations that are leading to the final state of this variables".
 And you have compiled function which does that.
 So - you say you want metrics, you will get function that is only computing metrics.
 You want prediction - you will only get the prediction.

 Theoretically you would rather install all of metrics here and only request what you do need.
 Actually, that sounds not so bad. Yeah, it sounds good. I'll do this one day.

 * */


import type {EdgeType, MetricFunction, NodeType, Optimizer} from '../../types';
import {Graph} from '../../Graph';
import {operations, Variable} from '../../tf';
import {createOperationsSequence, FullfillnessOperation, TransitionOperation} from './createOperationsSequence';


type Init = {
    loss?: MetricFunction;
    optimizer?: Optimizer;
    metrics?: MetricFunction[];
};

type Result = {
    inputVariables: Variable[],
    outputVariables: Variable[],
    outputExpectedVariables: Variable[],
    metricVariables: Variable[],
    newWeightsVariables: Variable[],
}

export function createComputationsGraph(model: Graph, {loss, optimizer, metrics = []}: Init): Result {
    const inputVariables = [];
    const outputVariables = [];
    const metricVariables = [];
    const newWeightsVariables = [];
    const outputExpectedVariables = [];


    const inputs: WeakMap<NodeType, Variable[]> = new WeakMap();
    const outputs: WeakMap<NodeType, Variable[]> = new WeakMap();
    const derivatives: WeakMap<NodeType, Variable[]> = new WeakMap();

    for (const input of model.startNodes) if (input.value instanceof Variable) {
        const value = input.value;
        inputs.set(input, [value]);
        if (input.isInput)
            inputVariables.push(value);
    }

    /*FORWARD*/

    for (const operation of createOperationsSequence(model.startNodes, {
        getNodeEdges: (node: NodeType) => ({in: node.fromEdges, out: node.toEdges}),
        getEdgeNodes: (edge: EdgeType) => ({in: edge.fromNode, out: edge.toNode})
    })) switch (true) {
        case operation instanceof TransitionOperation:
            const {from, to, edge} = operation.params;
            if (!inputs.has(to))
                inputs.set(to, []);

            const toInputVectors = inputs.get(to);
            toInputVectors[edge.input] = outputs.get(from)[edge.output];
            break;
        case operation instanceof FullfillnessOperation:
            const {node} = operation.params;
            const nodeInputs = inputs.get(node);
            const nodeOutputs = node.outputShapes.map(shape => new Variable(shape))
            const nodeOutputDerivatives = node.outputShapes.map(shape => new Variable(shape))
            outputs.set(node, nodeOutputs);
            derivatives.set(node, nodeOutputDerivatives);
            node.activate(nodeInputs, nodeOutputs, nodeOutputDerivatives);
            break;
    }

    /*ERROR COMPUTATION*/

    const antigradientOutputs: WeakMap<NodeType, Variable[]> = new WeakMap();
    const antigradientInputs: WeakMap<NodeType, Variable[]> = new WeakMap();


    for (const output of model.endNodes) if (output.value instanceof Variable) {
        if (output.isOutput)
            outputVariables.push(output.value);

        if (output.expectedValue instanceof Variable) {
            outputExpectedVariables.push(output.expectedValue);
            for (const metricFunction of metrics) {
                const metric = new Variable([]);
                metricVariables.push(metric);
                metricFunction(metric, output.value, output.expectedValue);
            }

            if (loss && output.computeError instanceof Function) {
                output.computeError(loss);
                operations.axpy(Variable.scalar(-1), output.expectedValue, output.value);
                operations.cpsc(output.error, output.value, output.value);
                antigradientInputs.set(output, [output.value]);
            }
        }


    }

    if (optimizer) {
        /*BACKPROP*/

        for (const operation of createOperationsSequence(model.endNodes, {
            getNodeEdges: (node: NodeType) => ({in: node.toEdges, out: node.fromEdges}),
            getEdgeNodes: (edge: EdgeType) => ({in: edge.toNode, out: edge.fromNode})
        })) switch (true) {
            case operation instanceof TransitionOperation:
                const {from, to, edge} = operation.params;
                if (!antigradientInputs.has(to))
                    antigradientInputs.set(to, []);

                const toInputVectors = antigradientInputs.get(to);
                toInputVectors[edge.input] = antigradientOutputs.get(from)[edge.output];
                break;

            case operation instanceof FullfillnessOperation:
                const {node} = operation.params;

                const antigratientPlaceholder = node.inputShapes.map(shape => new Variable(shape));
                antigradientOutputs.set(node, antigratientPlaceholder)

                node.propagate(
                    antigradientInputs.get(node),
                    derivatives.get(node),
                    antigratientPlaceholder);

                if (node.isTrainable) {
                    //todo review - point of risc
                    optimizer(node.weights, antigratientPlaceholder[0]);
                    newWeightsVariables.push(node.weights);
                }
                break;
        }
    }

    return {
        inputVariables,
        outputVariables,
        outputExpectedVariables,
        metricVariables,
        newWeightsVariables,
    }
}