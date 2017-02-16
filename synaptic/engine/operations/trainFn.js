//@flow

import {Graph} from '../Graph/index';
import type {MetricFunction, Optimizer} from '../types';
import * as R from 'ramda';
import {operations, Session, Variable} from '../tf';
import {createComputationsGraph} from './util/createComputationsGraph';

type Init = {
    loss: MetricFunction;
    optimizer: Optimizer;
    metrics: MetricFunction[];
    epochs: number;
    verbose: number;
}

type Args = {
    x: Variable[][];
    y: Variable[][];
    callback: (metricTensors: Variable[]) => any;
}

type Return = void;


export async function createTrainFn(model: Graph,
    {loss, optimizer, metrics, verbose, epochs}: Init): Promise<(args: Args) => Promise<void>> {
    const {inputVariables, outputExpectedVariables, metricVariables, newWeightsVariables} = createComputationsGraph(model, {
        loss,
        optimizer,
        metrics
    })


    const session = new Session();

    await session.compile([...metricVariables, ...newWeightsVariables, ...outputExpectedVariables]);

    return async (x_set, y_set) => {
        const trainset = R.zip(x_set, y_set)
            .map(([x, y]) => [
                ...R.zip(inputVariables, x),
                ...R.zip(outputExpectedVariables, y),
            ])

        for (let i = 0; i < epochs; i++) {
            for (let j = 0; j < trainset.length; j++) {
                if (j % verbose === 0)
                    console.log('epoch', i, 'step', j)
                await session.write(trainset[j]);
                await session.run();
            }
        }
    }
}