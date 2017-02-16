//@flow

import {expect} from 'chai';
import {operations, Session, Variable} from './index.js';
/*

 describe.only('abstraction breakthrough of module "tf"', () => {
 it('should define var to placeholder', async () => {
 const placeholder = new Variable([1, 2]);
 const output = new Variable([1, 2]);
 operations.blas.copy(placeholder, output);

 const session = new Session([output]);
 await session.compile();
 await session.write([
 [placeholder, new Float32Array([1, 2])]
 ]);
 // $FlowBug
 expect(Array.from(placeholder.pointer.data)).to.deep.equal([1, 2])
 })

 it('should define value to passed var', async () => {
 const placeholder = new Variable([2]);
 const output = new Variable([2]);
 operations.blas.copy(placeholder, output);

 const session = new Session([output]);
 await session.compile();
 await session.write([
 [placeholder, new Float32Array([1, 2])]
 ]);
 await session.run();
 // $FlowBug
 expect(Array.from(output.pointer.data)).to.deep.equal([1, 2])
 })
 })
 */

describe('something that is suspiciously similar to TensorFlow', () => {

    it('should read variables', async () => {
        const variable = new Variable([1, 2], new Float32Array([5, 10]));
        const session = new Session();
        await session.compile([variable]);
        const [outputValue] = await session.read([variable]);

        expect(Array.from(outputValue)).to.deep.equal([5, 10])
    })

    it('should pass placeholders', async () => {
        const placeholder = new Variable([2]);
        const output = new Variable([2]);
        operations.blas.copy(placeholder, output);

        const session = new Session();
        await session.compile([output]);
        await session.write([
            [placeholder, new Float32Array([1, 2])]
        ]);
        await session.run();
        const [outputValue] = await session.read([output]);

        expect(Array.from(outputValue)).to.deep.equal([1, 2])
    })

    it('should use vars', async () => {
        const placeholder = new Variable([1, 1], undefined, 'placeholder');
        const scale = new Variable([1, 1], new Float32Array([2]), 'scale');
        const output = new Variable([1, 1], undefined, 'output');
        operations.blas.gemm(output, placeholder, scale);

        const session = new Session();
        await session.compile([output]);
        await session.write([
            [placeholder, new Float32Array([2])]
        ]);
        await session.run();
        const [outputValue] = await session.read([output]);

        expect(Array.from(outputValue)).to.deep.equal([4])
    })

    it('should support multiple outputs', async () => {
        const placeholder = new Variable([1, 1]);
        const scale1 = new Variable([1, 1], new Float32Array([2]));
        const scale2 = new Variable([1, 1], new Float32Array([3]));
        /*wrapper around BLAS.gemm*/
        const output1 = new Variable([1, 1]);
        operations.blas.gemm(output1, placeholder, scale1);
        const output2 = new Variable([1, 1]);
        operations.blas.gemm(output2, placeholder, scale2);

        const session = new Session();
        await session.compile([output1, output2]);
        await session.write([
            [placeholder, new Float32Array([1])]
        ]);
        await session.run();
        const [outputValue1, outputValue2] = await session.read([output1, output2]);

        expect(Array.from(outputValue1)).to.deep.equal([2]);
        expect(Array.from(outputValue2)).to.deep.equal([3]);
    })
    it('should support multiple inputs', async () => {
        const placeholder1 = new Variable([1, 1]);
        const placeholder2 = new Variable([1, 1]);
        const output = new Variable([1, 1]);
        operations.blas.gemm(output, placeholder1, placeholder2);

        const session = new Session();
        await session.compile([output]);
        await session.write([
            [placeholder1, new Float32Array([2])],
            [placeholder2, new Float32Array([3])]
        ]);
        await session.run();
        const [outputValue] = await session.read([output]);

        expect(Array.from(outputValue)).to.deep.equal([6]);
    })
    it('should keep variable value between computations', async () => {
        const variable = new Variable([1], new Float32Array([1]));
        const placeholder = new Variable([1]);

        operations.blas.axpy(Variable.scalar(1), placeholder, variable);

        const session = new Session();
        await session.compile([variable]);
        await session.write([
            [placeholder, new Float32Array([1])],
        ]);
        await session.run();

        const [outputValue1] = await session.read([variable]);
        expect(Array.from(outputValue1)).to.deep.equal([2]);
        const [outputValue2] = await session.read([variable]);
        expect(Array.from(outputValue2)).to.deep.equal([2]);
        await session.run();
        const [outputValue3] = await session.read([variable]);
        expect(Array.from(outputValue3)).to.deep.equal([3]);
    })
})