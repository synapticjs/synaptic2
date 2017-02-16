import {expect} from 'chai';
import {Architect} from '../../architect/';
import {ScijsEngine} from './';

describe('ScijsComputationEngine', () => {
	it('should compile pipe network', async() => {
		const architecture = new Architect({
			inputs: [
				[1, 10]
			],
			outputs: [
				[1, 10]
			]
		});

		architecture.connect(architecture.inputs[0], architecture.outputs[0]);

		const engine = new ScijsEngine();
		await engine.init;
		const compiledArchitecture = await engine.compile(architecture);

		const testArray = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		compiledArchitecture.inputs[0].value.write(testArray);
		await compiledArchitecture.run();
		const output = await compiledArchitecture.outputs[0].value.read();
		expect(Array.from(output)).to.deep.equal(Array.from(testArray));
	})
})