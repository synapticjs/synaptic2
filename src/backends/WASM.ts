/// <reference path="../../node_modules/@types/webassembly-js-api/index.d.ts" />

declare var console, global;
import Lysergic, { StatusTypes } from 'lysergic';
import { TrainEntry, Backend, TrainOptions, TrainResult } from '.';
import emit from '../emiters/wasm';


export type AsmModule = {
  module: any,
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
}

export default class WASM implements Backend {

  asm: AsmModule = null;

  constructor(public engine = new Lysergic()) { }

  WASMModule: any = null;

  binary: ArrayBuffer | Uint8Array = null;

  async build(): Promise<AsmModule> {
    if (!global.WebAssembly) {
      throw new Error('Your platform doesnt support WebAssembly. (requires compilant browser or Node 8)');
    }

    const AST = this.engine.getAST();

    this.WASMModule = emit(AST, null);

    const memoryPages = ((this.engine.heap.byteLength / 65536) | 0) + 1;

    this.WASMModule.setMemory(memoryPages, memoryPages + 1, "mem", [{
      offset: this.WASMModule.i32.const(this.engine.heap.byteLength),
      data: this.engine.heap
    }]);

    this.WASMModule.autoDrop();

    this.binary = this.WASMModule.emitBinary();

    const instance = await WebAssembly.instantiate(this.binary, {
      imports: {
        exp: Math.exp,
        log: Math.log,
        pow: Math.pow,
        random: this.engine.random
      }
    });

    if (!this.WASMModule.validate()) {
      console.log(this.WASMModule.emitText());
      throw new Error('WASM Validation failed!');
    }

    const memoryBuffer: ArrayBuffer = instance.instance.exports.mem.buffer;

    if (memoryBuffer.byteLength < this.engine.heap.byteLength) {
      console.log(`Memory size: ${memoryBuffer.byteLength} Heap: ${this.engine.heap.byteLength}`);
      throw new Error(`WAM Memory is smaller than working heap ${memoryBuffer.byteLength} < ${this.engine.heap.byteLength}`);
    }

    // Copy working memory to the new module memory
    let newMemory = new Float64Array(this.engine.heap);
    for (let i = 0; i < this.engine.memory.byteLength; i++)
      newMemory[i] = this.engine.memory[i];

    // Update working memory
    this.engine.heap = memoryBuffer;
    this.engine.memory = newMemory;


    { // Test the WASM Module
      let val = Math.random();

      let originalA = this.engine.memory[0];
      let originalB = this.engine.memory[1];

      this.engine.memory[0] = val;
      this.engine.memory[1] = 3;
      if (instance.instance.exports.test() != (val + 3)) throw new Error('Heap could not be written ' + JSON.stringify([(val + 3), instance.instance.exports.test()]));
      this.engine.memory[0] = originalA;
      this.engine.memory[1] = originalB;
    }

    this.asm = {
      module: this.WASMModule,
      activate: (inputs: number[]) => {
        this.engine.setInputs(inputs);
        instance.instance.exports.activate();
        return this.engine.getOutputs();
      },
      propagate: (targets: number[]) => {
        this.engine.setTargets(targets);
        instance.instance.exports.propagate();
      }
    };

    return this.asm;
  }

  activate(inputs: number[]): number[] {
    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.ACTIVATING;
    if (this.asm == null) {
      throw new Error('The network wasn\'t built');
      // this.asm = this.build();
    }
    const activation = this.asm.activate(inputs);
    this.engine.status = oldStatus;
    return activation;
  }

  propagate(targets: number[]) {
    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.PROPAGATING;
    if (this.asm == null) {
      throw new Error('The network wasn\'t built');
      // this.asm = this.build();
    }
    this.asm.propagate(targets);
    this.engine.status = oldStatus;
  }

  async train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction }: TrainOptions): Promise<TrainResult> {
    if (this.asm == null) {
      this.asm = await this.build();
    }

    // start training
    let startTime = new Date().getTime();
    let error = Infinity;
    let iterations = 0;

    this.engine.learningRate = learningRate;
    this.engine.status = StatusTypes.TRAINING;

    // train
    while (error > minError && iterations < maxIterations) {
      error = 0;
      for (let index = 0; index < dataset.length; index++) {
        const { input, output } = dataset[index];
        const predictedOutput = this.activate(input);
        this.propagate(output);
        error += Lysergic.costFunction(output, predictedOutput, costFunction);
      }
      error /= dataset.length;
      iterations++;
    }

    // end training
    this.engine.status = StatusTypes.IDLE;

    return {
      error,
      iterations,
      time: new Date().getTime() - startTime
    };
  }
}