import {expect} from 'chai';
import {Layer} from './layer';

describe('Architect.internal.Layer: a base layer to inherit from', () => {
    it('should provide name', () => {
        expect(new Layer()).to.have.property('type', 'Layer');
        expect(new (class Foo extends Layer{})()).to.have.property('type', 'Foo');
    })
    it('should name an anonymous layer', () => {
        expect(new (class extends Layer{})()).to.have.property('type', 'AnonymousLayer');
        expect(new (class extends Layer{})()).to.have.property('type', 'AnonymousLayer_1');
    })
    it('should dump abstract layer', () => {
        expect(new Layer().toJSON()).to.deep.equal({type: 'Layer'})
    })
    it('should dump abstract layer with properties', () => {
        expect(Object.assign(new Layer(), {properties: {foo: 'bar'}}).toJSON()).to.deep.equal({type: 'Layer', foo: 'bar'})
    })
})