import {compileDependencies, Dependency} from './index';
import {expect} from 'chai';

describe('Orchestrator', () => {
    it('should create simple dependency pipe', () => {
        const execs = [];
        const dep = new Dependency(() => execs.push(1));
        const runner = new Dependency(Dependency.nonce, [dep]).compile();
        expect(execs).to.deep.equal([]);
        runner();
        expect(execs).to.deep.equal([1]);
    });
    it('should support chain syntax', () => {
        const execs = [];
        const runner = new Dependency(() => execs.push(1)).join(new Dependency(() => execs.push(2))).compile();
        runner();
        expect(execs).to.deep.equal([1, 2]);
    });

    it('should create streamed dependency pipe', () => {
        const execs = [];
        const dep1 = new Dependency(() => execs.push(1));
        const dep2 = new Dependency(() => execs.push(2), [dep1]);
        const runner = new Dependency(Dependency.nonce, [dep2]).compile();
        runner();
        expect(execs).to.deep.equal([1, 2]);
    });

    it('should omit not needed dependencies', () => {
        const execs = [];
        const dep1 = new Dependency(() => execs.push(1));
        const dep2 = new Dependency(() => execs.push(2), [dep1]);
        const runner = new Dependency(Dependency.nonce, [dep1]).compile();
        runner();
        expect(execs).to.deep.equal([1]);
    });

    it('should omit not needed dependencies (2)', () => {
        const execs = [];
        const dep1 = new Dependency(() => execs.push(1));
        const dep2 = new Dependency(() => execs.push(2), [dep1]);
        const dep3 = new Dependency(() => execs.push(3), [dep1]);
        const runner = new Dependency(Dependency.nonce, [dep3]).compile();
        runner();
        expect(execs).to.deep.equal([1, 3]);
    });

    it('should compile multi-input deps', () => {
        const execs = [];
        const dep1 = new Dependency(() => execs.push(1));
        const dep2 = new Dependency(() => execs.push(2));
        const dep3 = new Dependency(() => execs.push(3), [dep1, dep2]);
        const runner = new Dependency(Dependency.nonce, [dep3]).compile();
        runner();
        expect(execs).to.deep.equal([1, 2, 3]);
    });

    it('should compile multi-output deps', () => {
        const execs = [];
        const dep1 = new Dependency(() => execs.push(1));
        const dep2 = new Dependency(() => execs.push(2), [dep1]);
        const dep3 = new Dependency(() => execs.push(3), [dep1]);
        const runner = new Dependency(Dependency.nonce, [dep2, dep3]).compile();
        runner();
        expect(execs).to.deep.equal([1, 2, 3]);
    });

    it('should compile diamond-shaped deps', () => {
        const execs = [];
        const dep1 = new Dependency(() => execs.push(1));
        const dep2 = new Dependency(() => execs.push(2), [dep1]);
        const dep3 = new Dependency(() => execs.push(3), [dep1]);
        const dep4 = new Dependency(() => execs.push(4), [dep2, dep3]);
        const runner = new Dependency(Dependency.nonce, [dep4]).compile();
        runner();
        expect(execs).to.deep.equal([1, 2, 3, 4]);
    });
})