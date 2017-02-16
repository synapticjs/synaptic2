//@flow
import {Variable} from './tf';
export {Variable} from './tf';
import type {Shape} from '../types';
export type {Shape} from '../types';

export type EdgeType = {
    fromNode: NodeType;
    toNode: NodeType;
    shape: Shape;
    input: number;
}

export type NodeType = {
    toEdges: EdgeType[];
    fromEdges: EdgeType[];
    inputShapes: Shape[];
    outputShapes: Shape[];

    options: any;

    //this looks like something that should be reviewed
    value?: Variable;
    expectedValue?: Variable;
}

export type MetricFunction = (target: Variable, y_pred: Variable, y: Variable) => void;

export type Optimizer = (weights: Variable, deltas: Variable) => void;

type TransitionOperation = {
    type: 'transition',
    params: {
        from: NodeType,
        to: NodeType,
        edge: EdgeType
    }
}

type FullfillnessOperation = {
    type: 'fullfillness',
    params: {
        node: NodeType,
    }
}

export type OperationsSequence = Array<TransitionOperation | FullfillnessOperation>;