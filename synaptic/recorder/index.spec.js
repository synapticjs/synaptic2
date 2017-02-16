import {expect} from 'chai';
import {Recorder} from './';

describe('Recorder', () => {
    it('should produce a computation graph', () => {
        const recorder = new Recorder();
        recorder.list([]);

        expect(recorder.ast).to.deep.equal([
            ['list', []]
        ])
    })
    it('should produce a computation graph with id-based functions', () => {
        const recorder = new Recorder();
        const test = recorder.fn(() => {
            recorder.list([]);
        })

        test();
        test();

        expect(recorder.ast).to.deep.equal([
            ['defn', 0, [
                ['list', []]
            ]],
            [0],
            [0],
        ])
    })
    it('should produce a computation graph with pointers', () => {
        const recorder = new Recorder();
        const a = recorder.pointer([]);
        const b = recorder.pointer([2, 3]);
        recorder.ones(b);
        const c = recorder.pointer([2, 3]);
        recorder.blas.copy(b, c);

        expect(recorder.ast).to.deep.equal([
            ['allocate', a],
            ['allocate', b],
            ['allocate', c],
            ['ones', b],
            ['blas.copy', b, c],
        ])
    })
})