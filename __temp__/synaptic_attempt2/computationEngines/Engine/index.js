import type {SerializedArchitecture} from '../../architect/Architect';

export class Engine {
	static functions = {
		'run': 'run'
	}

	async use(networkGraph: SerializedArchitecture): Promise<void> { throw new Error('method not implemened') }

	async compileFn(functionName: string): Promise<void> { throw new Error('method not implemened') }

	async runFn(functionName: string): Promise<void> { throw new Error('method not implemened') }
}