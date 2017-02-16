import {Graph} from '../Graph/index';
import type {MetricFunction} from '../types';
import {createComputationsGraph} from './util/createComputationsGraph';
import * as R from 'ramda';
import {operations, Session, Variable} from '../tf';

type Init = {
    verbose: boolean;
    metrics: MetricFunction[];
}

type Args = {
    x: Variable[][];
    y: Variable[][];
}

type Return = Variable[];

export async function createEvaluateFn(model: Graph, {
    metrics,
}: Init): Promise<(args: Args) => Promise<Return>> {
    const {inputVariables, outputExpectedVariables, metricVariables} = createComputationsGraph(model, {metrics})

    const session = new Session();

    await session.compile([...metricVariables]);

    return async (x_set, y_set) => {
        const trainset = R.zip(x_set, y_set)
            .map(([x, y]) => [
                ...R.zip(inputVariables, x),
                ...R.zip(outputExpectedVariables, y),
            ])

        for (let j = 0; j < trainset.length; j++) {
            await session.write(trainset[j]);
            await session.run();
        }

        return await session.read(metricVariables);
    }
}