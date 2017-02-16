import {Executor} from './';

export class CompiledGraphRunner {
    executor: Executor;
    graphId: number;

    constructor(executor, graphId) {
        this.executor = executor;
        this.graphId = graphId;
    }

    run(loggingCallback?: (value: Ndarray)=>any) { return this.executor.transport.run(this.graphId, loggingCallback) }

    destroy() { return this.executor.transport.uncompile(this.graphId) }
}