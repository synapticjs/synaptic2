//@flow

import {operations, Variable} from '../tf';

export const SGD = ({learningRate}: { learningRate: number }) => {
    const lr = Variable.scalar(-learningRate);
    return function SGDOptimizer(weights: Variable, grad: Variable): void {
        operations.axpy(lr, grad, weights)
    }
}
