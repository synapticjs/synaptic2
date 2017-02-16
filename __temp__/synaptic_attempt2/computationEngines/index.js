export type CompiledGraph = {
	run(input: NDArray): Promise<>;
	train(X: NDArray, y: NDArray): Promise<>;
}


export type Engine = {
	compile(g: Graph): Promise<CompiledGraph>;
}

export type EngineClass = Class<Engine>

export {ScijsEngine} from './ScijsEngine/index.js'