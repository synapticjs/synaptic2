/// <reference path="../node_modules/@types/mocha/index.d.ts" />
declare var process, console;

import { backends } from '../src';

import { run as notMochaRunner, storeResults } from './performance/performanceRunner';

function run(test: string, backend, only?: boolean) {

  const fn = only ? it.only : it;

  fn(test, function (done) {
    this.timeout(360000);

    notMochaRunner(test, { backend }).then(() => done(), err => done(err));
  });
}


describe('Performance tasks', () => {
    // describe('Paper', () => {
    //   it('XOR', run('XOR', backends.Paper));
    //   it('AND', run('AND', backends.Paper));
    //   it('OR', run('OR', backends.Paper));
    //   it('NOT', run('NOT', backends.Paper));
    // });

    // describe('CPU', () => {
    //   it('XOR', run('XOR', backends.CPU));
    //   it('AND', run('AND', backends.CPU));
    //   it('OR', run('OR', backends.CPU));
    //   it('NOT', run('NOT', backends.CPU));
    // });

    describe('ASM', () => {
        run('XOR', backends.ASM);
        run('TIMING_TASK', backends.ASM);
        run('DSR', backends.ASM);
        run('MNIST', backends.ASM);
        run('SOFTMAX_MNIST', backends.ASM);
        run('CONV_MNIST', backends.ASM, true);
        // run('WRITE', backends.ASM);
    });

    describe('WASM', () => {
        run('XOR', backends.WASM);
        run('TIMING_TASK', backends.WASM);
        run('DSR', backends.WASM);
        run('MNIST', backends.WASM);
        run('SOFTMAX_MNIST', backends.WASM);
        run('CONV_MNIST', backends.WASM);
    });
});


after(function () {
  this.timeout(10000);
  if (process.env.CI) { // do not store results in CI
    console.log('Skipping storeResults in CI');
  } else {
    storeResults('test-results');
  }
});
