import {expect} from 'chai';
import {FeedForward} from './feedforward';
import {Layer} from '../internal/layer';

describe.only('Architect.FeedForward: a feed-forward net wrapper', () => {
    const layer1 = new Layer([1, 10], [1, 20]);
    const layer2 = new Layer([1, 20], [1, 5]);

    it('should provide name', () =>
        expect(new FeedForward([layer1, layer2]))
            .to.have.property('type', 'FeedForward'))

    it('should throw an error if incompatible layers are passed', () =>
        expect(() => new FeedForward([layer2, layer1]))
            .to.throw(TypeError))
    it('should throw an error no layer is passed', () =>
        expect(() => new FeedForward([]))
            .to.throw(TypeError))


    it('should dump properly', () => {
        /*important: layer objects should not be used twice in one net*/
        const layer1 = new Layer([1, 10], [1, 20]);
        const layer2 = new Layer([1, 20], [1, 5]);
        const dump = new FeedForward([layer1, layer2]).toJSON();
        expect(dump)
            .to.deep.include({type: 'FeedForward'});

        expect(dump.nodes)
            .to.have.length(2)
            .and
            .to.deep.include(layer1.toJSON())
            .and
            .to.deep.include(layer2.toJSON())

        expect(dump.edges)
            .to.deep.equal([{
            from: 0,
            to: 1,
            shape: layer1.outputShape
        }])
    })
})