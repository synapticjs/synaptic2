declare var console;

import Lysergic, { ActivationTypes, CostTypes, StatusTypes } from 'lysergic';
import { TrainEntry, Backend, TrainOptions, TrainResult } from '.';

export default class CPU implements Backend {
  constructor(public engine = new Lysergic()) {

  }

  private activateUnit(j: number): number {
    let i = 0, k = 0, h = 0, g = 0, to = 0, from = 0, engine = this.engine;
    let state = 0;
    let activation = 0;
    let derivative = 0;
    let elegibilityTrace = 0;
    let elegibilityTraceDerivated = 0;
    let inputSetLength = 0;
    let localGainByWeight = engine.gain[j][j] * engine.weight[j][j];
    state = engine.state[j];
    state = state * localGainByWeight;

    inputSetLength = engine.inputSet[j].length;
    for (h = 0; h < inputSetLength; h++) {
      i = engine.inputSet[j][h];
      if (engine.gain[j][i] !== 0)
        state = state + engine.gain[j][i] * engine.weight[j][i] * engine.activation[i];
    }
    engine.state[j] = state;

    activation = this.activationFunction(j);
    engine.activation[j] = activation;

    derivative = this.activationFunctionDerivative(j);

    engine.derivative[j] = derivative;

    for (h = 0; h < inputSetLength; h++) {
      i = engine.inputSet[j][h];
      elegibilityTrace = localGainByWeight * engine.elegibilityTrace[j][i] + engine.gain[j][i] * engine.activation[i];
      engine.elegibilityTrace[j][i] = elegibilityTrace;
      elegibilityTraceDerivated = elegibilityTrace * derivative;
      for (g = 0; g < engine.gatedBy[j].length; g++) {
        k = engine.gatedBy[j][g];
        engine.extendedElegibilityTrace[j][i][k] = engine.gain[k][k] * engine.weight[k][k] * engine.extendedElegibilityTrace[j][i][k] + elegibilityTraceDerivated * this.bigParenthesisTerm(k, j);
      }
    }

    for (h = 0; h < engine.gatedBy[j].length; h++) {
      to = engine.gatedBy[j][h];
      for (g = 0; g < engine.inputsOfGatedBy[to][j].length; g++) {
        from = engine.inputsOfGatedBy[to][j][g];
        engine.gain[to][from] = activation;
      }
    }


    return activation;
  }

  private propagateUnit(unit: number) {
    let k = 0, h = 0, engine = this.engine;
    let gatedErrorResponsibility = 0;
    let projectedErrorResponsibility = 0;

    for (h = 0; h < engine.projectionSet[unit].length; h++) {
      k = engine.projectionSet[unit][h];
      projectedErrorResponsibility = projectedErrorResponsibility + engine.errorResponsibility[k] * engine.gain[k][unit] * engine.weight[k][unit];
    }
    engine.projectedErrorResponsibility[unit] = projectedErrorResponsibility * engine.derivative[unit];

    for (h = 0; h < engine.gateSet[unit].length; h++) {
      k = engine.gateSet[unit][h];
      gatedErrorResponsibility = gatedErrorResponsibility + engine.errorResponsibility[k] * this.bigParenthesisTerm(k, unit);
    }
    engine.gatedErrorResponsibility[unit] = gatedErrorResponsibility * engine.derivative[unit];

    engine.errorResponsibility[unit] = engine.projectedErrorResponsibility[unit] + engine.gatedErrorResponsibility[unit];

    this.propagateUnitWeights(unit);
  }

  /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
  bigParenthesisTerm(k: number, j: number) {
    let result = this.engine.derivativeTerm[k][j] * this.engine.weight[k][k] * this.engine.state[k];
    for (let i = 0; i < this.engine.inputsOfGatedBy[k][j].length; i++) {
      let a = this.engine.inputsOfGatedBy[k][j][i];
      if (a !== k) {
        result += this.engine.weight[k][a] * this.engine.activation[a];
      }
    }
    return result;
  }

  activationFunction(unit: number): number {
    let x;
    const type = this.engine.activationFunction[unit];
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.engine.state[unit];
        return 1 / (1 + Math.exp(-x));

      case ActivationTypes.TANH:
        x = this.engine.state[unit];
        const eP = Math.exp(x);
        const eN = 1 / eP;
        return (eP - eN) / (eP + eN);

      case ActivationTypes.RELU:
        x = this.engine.state[unit];
        return x > 0 ? x : 0;

      case ActivationTypes.IDENTITY:
        x = this.engine.state[unit];
        return x;

      case ActivationTypes.MAX_POOLING:
        const inputUnit = this.engine.inputsOf[unit][0];
        const gatedUnit = this.engine.gatedBy[unit][0];
        const inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit];
        const maxActivation = inputsOfGatedUnit.reduce((max, input) => Math.max(this.engine.activation[input], max), -Infinity);
        const inputUnitWithHigherActivation = inputsOfGatedUnit.reduce((found, unit) => this.engine.activation[unit] === maxActivation ? unit : found, null);
        return inputUnitWithHigherActivation === inputUnit ? 1 : 0;

      case ActivationTypes.DROPOUT:
        const chances = this.engine.state[unit];
        return this.engine.random() < chances && this.engine.status === StatusTypes.TRAINING ? 0 : 1;

      // case ActivationTypes.EXP:
      //   return Math.exp(this.engine.state[unit]);

      // case ActivationTypes.INVERSE_IDENTITY:
      //   return 1 / this.engine.state[unit];
    }
    return this.engine.state[unit];
  }

  activationFunctionDerivative(unit: number) {
    let x: number;
    const type = this.engine.activationFunction[unit];
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.engine.activation[unit];
        return x * (1 - x);

      case ActivationTypes.TANH:
        x = this.engine.activation[unit];
        return 1 - (x * x);
      case ActivationTypes.IDENTITY:
        return 1;
      /*
      case ActivationTypes.EXP:
        return this.engine.activation[unit];

      case ActivationTypes.INVERSE_IDENTITY:
        x = this.engine.activation[unit];
        return -1 / (x * x);
      
      /*case ActivationTypes.RELU:
        return 0

      case ActivationTypes.IDENTITY:
        return 0

      case ActivationTypes.MAX_POOLING:
        return 0

      case ActivationTypes.DROPOUT:
        return 0*/
      default:
        return 0;
    }
  }

  costFunction(target: number[], predicted: number[], costType: CostTypes) {
    let i: number, x = 0;
    switch (costType) {
      case CostTypes.MEAN_SQUARE_ERROR:
        for (i = 0; i < target.length; i++) {
          x += Math.pow(target[i] - predicted[i], 2);
        }
        return x / target.length;

      case CostTypes.CROSS_ENTROPY:
        for (i = 0; i < target.length; i++) {
          x -= (target[i] * Math.log(predicted[i] + 1e-15)) + ((1 - target[i]) * Math.log((1 + 1e-15) - predicted[i])); // +1e-15 is a tiny push away to avoid Math.log(0)
        }
        return x;

      case CostTypes.BINARY:
        for (i = 0; i < target.length; i++) {
          x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0;
        }
        return x;
    }
  }

  activate(inputs: number[]): number[] {
    this.engine.status = StatusTypes.ACTIVATING;
    let outputLayerIndex = this.engine.layers.length - 1;
    let activation = new Array(this.engine.layers[outputLayerIndex].length);

    for (let j = 0; j < this.engine.layers[0].length; j++) {
      this.engine.activation[this.engine.layers[0][j]] = inputs[j];
    }

    for (let layer = 1; layer < this.engine.layers.length - 1; layer++) {
      for (let j = 0; j < this.engine.layers[layer].length; j++) {
        this.activateUnit(this.engine.layers[layer][j]);
      }
    }

    for (let j = 0; j < this.engine.layers[outputLayerIndex].length; j++) {
      activation[j] = this.activateUnit(this.engine.layers[outputLayerIndex][j]);
    }

    this.engine.status = StatusTypes.IDLE;
    return activation;
  }

  private propagateUnitWeights(unit: number) {
    let i = 0, Δw = 0, k = 0, g = 0, h = 0;
    let engine = this.engine;

    const unitExtendedElegibilityTraces = engine.extendedElegibilityTrace[unit];
    const unitElegibilityTraces = engine.elegibilityTrace[unit];
    const unitGateSet = engine.gateSet[unit];
    const unitInputSet = engine.inputSet[unit];
    const unitInputSetLength = unitInputSet.length;
    const unitProjectedErrorResponsibility = engine.projectedErrorResponsibility[unit];

    for (h = 0; h < unitInputSetLength; h++) {
      i = unitInputSet[h];
      Δw = unitProjectedErrorResponsibility * unitElegibilityTraces[i];
      for (g = 0; g < unitGateSet.length; g++) {
        k = unitGateSet[g];
        Δw += engine.errorResponsibility[k] * unitExtendedElegibilityTraces[i][k];
      }
      Δw *= engine.learningRate;
      engine.weight[unit][i] += Δw;
    }
  }

  propagate(targets: number[]) {
    this.engine.status = StatusTypes.PROPAGATING;
    let outputLayerIndex = this.engine.layers.length - 1;
    if (this.engine.layers[outputLayerIndex].length != targets.length) {
      throw new Error(`Invalid number of projected targets, expecting ${this.engine.layers[outputLayerIndex].length} got ${targets.length}`);
    }

    for (let j = this.engine.layers[outputLayerIndex].length - 1; j >= 0; j--) {
      let unit = this.engine.layers[outputLayerIndex][j];
      this.engine.errorResponsibility[unit] = this.engine.projectedErrorResponsibility[unit] = targets[j] - this.engine.activation[unit];
      this.propagateUnitWeights(unit);
    }

    for (let i = this.engine.layers.length - 2; i > 0; i--) {
      for (let j = this.engine.layers[i].length - 1; j >= 0; j--) {
        this.propagateUnit(this.engine.layers[i][j]);
      }
    }
    this.engine.status = StatusTypes.IDLE;
  }

  async train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction }: TrainOptions): Promise<TrainResult> {

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
        error += this.costFunction(output, predictedOutput, costFunction);
      }
      error /= dataset.length;
      iterations++;
      console.log({ error, iterations });
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
