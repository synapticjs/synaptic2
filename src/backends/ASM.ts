declare var console;
import { Backend } from './Backend';
import emiter = require('../emiters/asm');
import { StatusTypes } from "lysergic";

export default class ASM extends Backend {
  asmModule: any;

  async build() {
    const AST = this.compiler.getAST();
    const source = emiter.emit(AST);

    if (emiter.DEBUG)
      console.log(source);

    let getModule: (stdlib, foreign, heap) => any;

    try {
      getModule = new Function('stdlib', 'foreign', 'heap', source) as any;
    } catch (e) {
      console.log(source);
      throw e;
    }

    const foreign = {};

    const memory = await this.compiler.getBuffer();

    let memoryElems = await this.compiler.getMemory();

    for (let i = 0; i < memoryElems.length; i++) {
      let element = memoryElems[i];
      if (isNaN(element) || element == undefined) {
        throw new Error(`Memory index ${i} is NaN (${element})`);
      }
    }

    this.asmModule = getModule({ Math, Float64Array }, foreign, memory);

    this.activate = async (inputs: number[]) => {
      const oldStatus = this.compiler.engineStatus;
      this.compiler.engineStatus = StatusTypes.ACTIVATING;

      await this.compiler.setInputs(inputs);
      this.asmModule.activate();
      const activation = await this.compiler.getOutputs();
      this.compiler.engineStatus = oldStatus;
      return activation;
    };

    this.propagate = async (targets: number[]) => {
      const oldStatus = this.compiler.engineStatus;
      this.compiler.engineStatus = StatusTypes.PROPAGATING;
      await this.compiler.setTargets(targets);
      this.asmModule.propagate();
      this.compiler.engineStatus = oldStatus;
    };

    this.built = true;
  }
}