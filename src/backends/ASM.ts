declare var console;
import Lysergic, { StatusTypes } from 'lysergic';
import { TrainEntry, Backend, TrainOptions, TrainResult } from '.';

export type AsmModule = {
  module: any,
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
}

export default class ASM implements Backend {

  asm: AsmModule = null;

  constructor(public engine = new Lysergic()) { }

  build(): AsmModule {
    const AST = this.engine.getAST();
    const source = `"use asm";
var H = new stdlib.Float64Array(heap);
var exp = stdlib.Math.exp;
var pow = stdlib.Math.pow;
var random = foreign.random;
${AST}
return {
  activate: activate,
  propagate: propagate
}`;
    console.log(source);
    const getModule = new Function('stdlib', 'foreign', 'heap', source);
    const foreign = { random: this.engine.random };
    const module = getModule({ Math, Float64Array }, foreign, this.engine.heap);
    return {
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
  }

  activate(inputs: number[]): number[] {
    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.ACTIVATING;
    if (this.asm == null) {
      this.asm = this.build();
    }
    const activation = this.asm.activate(inputs);
    this.engine.status = oldStatus;
    return activation;
  }

  propagate(targets: number[]) {
    const oldStatus = this.engine.status;
    this.engine.status = StatusTypes.PROPAGATING;
    if (this.asm == null) {
      this.asm = this.build();
    }
    this.asm.propagate(targets);
    this.engine.status = oldStatus;
  }

  async train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction }: TrainOptions): Promise<TrainResult> {
    if (this.asm == null) {
      this.asm = this.build();
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