import {expect} from 'chai';
import {Activation} from './activation';

describe('Architect.Activation: an activation layer', () => {
    it('should provide name', () =>
        expect(new Activation([1, 10], 'sigmoid')).to.have.property('type', 'Activation'))

    it('should provide name for named activation', () =>
        expect(new Activation.sigmoid([1, 10])).to.have.property('type', 'Activation'))

    it('should throw an error if bad activation is passed', () =>
        expect(() => new Activation([1, 10], 'foo')).to.throw(TypeError))

    it('should dump properly', () =>
        expect(new Activation.sigmoid([1, 10]).toJSON()).to.deep.equal({type: 'Activation', activationFunctionName: 'sigmoid'}))
})