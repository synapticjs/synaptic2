/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { backends } from '../src';

import { run as notMochaRunner } from './performance/performanceRunner';

import XOR from './performance/specs/XOR';
import AND from './performance/specs/AND';
import OR from './performance/specs/OR';
import NOT from './performance/specs/NOT';
import MNIST from './performance/specs/MNIST';

function run(test, backend) {
  return function (done) {
    this.timeout(60000);

    notMochaRunner(test, { backend }).then(() => done(), err => done(err));
  };
}

describe('Performance tasks', () => {
  describe.only('Paper', () => {
    it('XOR', run(XOR, backends.Paper));
    it('AND', run(AND, backends.Paper));
    it('OR', run(OR, backends.Paper));
    it('NOT', run(NOT, backends.Paper));
  });

  describe.only('CPU', () => {
    it('XOR', run(XOR, backends.CPU));
    it('AND', run(AND, backends.CPU));
    it('OR', run(OR, backends.CPU));
    it('NOT', run(NOT, backends.CPU));
  });

  describe.only('ASM', () => {
    it('XOR', run(XOR, backends.ASM));
    it('AND', run(AND, backends.ASM));
    it('OR', run(OR, backends.ASM));
    it('NOT', run(NOT, backends.ASM));
    // it('MNIST', run(MNIST, backends.ASM));
  });

  describe('WASM', () => {
    it('XOR', run(XOR, backends.WASM));
    it('MNIST', run(MNIST, backends.WASM));
  });
});
