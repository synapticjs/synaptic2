// declare var console;
import { StatusTypes } from 'lysergic';
import { Backend } from './Backend';
import emit from '../emiters/asm';

export type AsmModule = {
  module: any,
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
}

export default class ASM extends Backend {
  asm: AsmModule = null;

  async build() {
    if (this.engine.status == StatusTypes.BUILDING)
      throw new Error("Already building.");


    this.engine.status = StatusTypes.BUILDING;
    const AST = this.engine.getAST();
    const source = emit(AST);

    // console.log(source);
    const getModule = new Function('stdlib', 'foreign', 'heap', source);
    const foreign = { random: this.engine.random };
    const module = getModule({ Math, Float64Array }, foreign, this.engine.heap);

    this.asm = {
      module,
      activate: (inputs: number[]) => {
        this.engine.setInputs(inputs);
        module.activate();
        return this.engine.getOutputs();
      },
      propagate: (targets: number[]) => {
        this.engine.setTargets(targets);
        module.propagate();
      }
    };

    this.built = true;

    this.engine.status = StatusTypes.IDLE;
  }

  async activate(inputs: number[]): Promise<number[]> {
    if (!this.built && this.engine.status != StatusTypes.BUILDING) {
      await this.build();
    }

    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.ACTIVATING;
    const activation = this.asm.activate(inputs);
    this.engine.status = oldStatus;
    return activation;
  }

  async propagate(targets: number[]) {
    if (!this.built && this.engine.status != StatusTypes.BUILDING) {
      await this.build();
    }

    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.PROPAGATING;
    this.asm.propagate(targets);
    this.engine.status = oldStatus;
  }
}