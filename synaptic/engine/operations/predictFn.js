import {Graph} from '../Graph/index';
import {createComputationsGraph} from './util/createComputationsGraph';
import * as R from 'ramda';
import {operations, Session, Variable} from '../tf';


type Init = {
    verbose: boolean;
};

type Args = {
    x: Variable[][];
}

type Return = Variable[];

export async function createPredictFn(model: Graph, {
    metrics,
}: Init): Promise<(args: Args) => Promise<Return>> {
    const {inputVariables, outputVariables} = createComputationsGraph(model, {metrics})

    const session = new Session();

    await session.compile([...outputVariables]);

    return async (x_set: Variable[]): Variable[] => {
        const inputs = R.zip(x_set, inputVariables);

        await session.write(inputs);
        await session.run();

        return await session.read(outputVariables);
    }
}