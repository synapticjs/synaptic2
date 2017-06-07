/// <reference path="../../node_modules/@types/webassembly-js-api/index.d.ts" />

declare var console, global;
import { StatusTypes } from 'lysergic';
import { Backend } from './Backend';
import emit from '../emiters/wasm';


export type AsmModule = {
  module: any,
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
}

export default class WASM extends Backend {
  asm: AsmModule = null;

  WASMModule: any = null;

  binary: ArrayBuffer | Uint8Array = null;

  async build() {
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
    let newMemory = new Float64Array(memoryBuffer);
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

    this.built = true;
  }

  async activate(inputs: number[]) {
    if (!this.built) {
      await this.build();
    }

    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.ACTIVATING;
    const activation = this.asm.activate(inputs);
    this.engine.status = oldStatus;
    return activation;
  }

  async propagate(targets: number[]) {
    if (!this.built) {
      await this.build();
    }

    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.PROPAGATING;
    this.asm.propagate(targets);
    this.engine.status = oldStatus;
  }
}