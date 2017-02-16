//@flow
import {operations, Variable} from '../tf';
import {OperationDependency} from '../tf/OperationDependency';

export const Accuracy = () =>
    function AccuracyMetric(metric: Variable, y_pred: Variable, y: Variable): void {
        metric.registerManipulation(new OperationDependency(operations.copy, [metric, y_pred]))
        metric.registerManipulation(new OperationDependency(operations.axpy, [Variable.scalar(-1), y, metric]))
    }


export const CategoricalCrossentropy = () =>
    function CategoricalCrossentropyMetric(metric: Variable, y_pred: Variable, y: Variable): void {

    }