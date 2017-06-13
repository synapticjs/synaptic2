declare var console;

import { TrainResult, Backend, TrainEntry } from "../../src/backends/Backend";
import { Trainer, Network, Lysergic } from "../../src/index";
import { CostTypes } from 'lysergic';

function interpolateBoundary(t, a, b) {

  return Math.min(Math.max(a, a + t * (b - a)), b);
}

function printError(error, errorSet) {
  let width = 50;

  let spaces = width - interpolateBoundary(error, 0, width);

  let progress = (new Array(width) as any).fill(' ');

  progress = progress.map(($, $$) => $$ <= spaces ? '=' : ' ').join('');

  return 'Error: ' + error.toFixed(6) + ' [' + progress + '] ' + (errorSet ? printErrorSet(errorSet) : "");
}

const braile = ' ⡀⣀⣄⣤⣴⣶⣾⣿';

function printErrorSet(errors) {
  if (errors.length > 100) return '';
  let max = Math.max(...errors);

  errors = errors.map($ => $ / max);

  return 'Error set: [' + errors.map($ => braile[($ * 8) | 0] || ' ').join('') + ']';
}

export abstract class PerformanceTest {
  learningRate = 0.1;
  minError = 0.001;
  maxIterations = 10000;
  costFunction: CostTypes = Lysergic.CostTypes.MEAN_SQUARE_ERROR;
  logEvery = 0;

  abstract async build(backend: typeof Backend): Promise<Network>;

  async run(network: Network): Promise<TrainResult> {
    const trainer = new Trainer(network);

    let trainingData = await this.getTrainigSet();

    let result = await trainer.train(trainingData, {
      learningRate: this.learningRate,
      minError: this.minError,
      maxIterations: this.maxIterations,
      log: this.logEvery ? this.log : null,
      costFunction: this.costFunction,
      logEvery: this.logEvery
    });

    return result;
  }

  log(partial: TrainResult, errorSet: ArrayLike<number>) {
    console.log(printError(partial.error, errorSet));
  }

  abstract async getTrainigSet(): Promise<TrainEntry[]>;
  abstract async getTestingSet(): Promise<TrainEntry[]>;

  async validate(network: Network, trainResult: TrainResult) {
    if (this.minError < trainResult.error)
      throw new Error('It didn\'t succeed ' + trainResult.error + ' > ' + this.minError);
  }
}