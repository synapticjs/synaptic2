/// <reference path="../../node_modules/@types/webassembly-js-api/index.d.ts" />

declare var console, global;
import { Backend } from './Backend';
import emit from '../emiters/wasm';
import { StatusTypes } from "lysergic";

import binaryen = require('binaryen');


// function emitWasm(module: binaryen.Module): Uint8Array {
//   try {
//     return module.emitBinary();
//   } catch (e) {
//     const MAX = 1024 * 1024 * 10;
//     const buffer = new Uint8Array(MAX);
//     console.log('size: ', binaryen['_BinaryenModuleWrite'](module, buffer, MAX));
//     return buffer;
//   }
// }

export default class WASM extends Backend {
  WASMModule: binaryen.Module = null;

  binary: ArrayBuffer | Uint8Array = null;

  async build() {
    if (!global.WebAssembly) {
      throw new Error('Your platform doesnt support WebAssembly. (requires compilant browser or Node 8)');
    }

    const AST = this.compiler.getAST();

    this.WASMModule = emit(AST, null);

    const memoryPages = ((this.compiler.heap.buffer.byteLength / 65536) | 0) + 1;

    // let byteArray = new Uint8Array(this.compiler.heap.buffer);

    this.WASMModule.setMemory(memoryPages, memoryPages + 1, "mem", [{
      offset: this.WASMModule.i32.const(this.compiler.heap.buffer.byteLength),
      data: new Uint8Array(0)
    }]);

    this.WASMModule.optimize();
    this.WASMModule.autoDrop();

    if (!this.WASMModule.validate()) {
      console.log(this.WASMModule.emitText());
      throw new Error('WASM Validation failed!');
    }

    // console.log(this.WASMModule.emitText());

    this.binary = this.WASMModule.emitBinary();

    const instance = await WebAssembly.instantiate(this.binary, {
      imports: {
        exp: Math.exp,
        log: Math.log,
        pow: Math.pow
      }
    });

    const memoryBuffer: ArrayBuffer = instance.instance.exports.mem.buffer;

    if (memoryBuffer.byteLength < this.compiler.heap.buffer.byteLength) {
      console.log(`Memory size: ${memoryBuffer.byteLength} Heap: ${this.compiler.heap.buffer.byteLength}`);
      throw new Error(`WAM Memory is smaller than working heap ${memoryBuffer.byteLength} < ${this.compiler.heap.buffer.byteLength}`);
    }

    // Copy working memory to the new module memory
    let newMemory = new Float64Array(memoryBuffer);
    for (let i = 0; i < this.compiler.heap.memory.byteLength; i++)
      newMemory[i] = this.compiler.heap.memory[i];

    // Update working memory
    this.compiler.heap.buffer = memoryBuffer;
    this.compiler.heap.memory = newMemory;

    { // Test the WASM Module
      let val = Math.random();

      let originalA = this.compiler.heap.memory[0];
      let originalB = this.compiler.heap.memory[1];

      this.compiler.heap.memory[0] = val;
      this.compiler.heap.memory[1] = 3;
      if (instance.instance.exports.test() != (val + 3))
        throw new Error('Heap could not be written ' + JSON.stringify([(val + 3), instance.instance.exports.test()]));
      this.compiler.heap.memory[0] = originalA;
      this.compiler.heap.memory[1] = originalB;
    }

    this.activate = async (inputs: number[]) => {
      const oldStatus = this.compiler.engineStatus;
      this.compiler.engineStatus = StatusTypes.ACTIVATING;
      await this.compiler.setInputs(inputs);
      instance.instance.exports.activate();
      const activation = await this.compiler.getOutputs();
      this.compiler.engineStatus = oldStatus;
      return activation;
    };

    this.propagate = async (targets: number[]) => {
      const oldStatus = this.compiler.engineStatus;
      this.compiler.engineStatus = StatusTypes.PROPAGATING;
      await this.compiler.setTargets(targets);
      instance.instance.exports.propagate();
      this.compiler.engineStatus = oldStatus;
    };

    this.built = true;
  }
}