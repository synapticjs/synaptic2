// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

import Lysergic, { ActivationTypes, CostTypes, StatusTypes } from 'lysergic';
import { Backend, TrainEntry } from '.';

export default class Paper implements Backend {
  constructor(public engine = new Lysergic()) {
    this.activateUnit = this.activateUnit.bind(this);
    this.propagateUnit = this.propagateUnit.bind(this);
    this.activate = this.activate.bind(this);
    this.propagate = this.propagate.bind(this);
    this.bigParenthesisTerm = this.bigParenthesisTerm.bind(this);
    this.activationFunction = this.activationFunction.bind(this);
    this.activationFunctionDerivative = this.activationFunctionDerivative.bind(this);
    this.costFunction = this.costFunction.bind(this);
    this.train = this.train.bind(this);
  }

  activateUnit(unit: number, input: number): number {
    // glosary
    const j = unit;
    const s = this.engine.state;
    const w = this.engine.weight;
    const g = this.engine.gain;
    const y = this.engine.activation;
    const f = this.activationFunction;
    const df = this.activationFunctionDerivative;
    const ε = this.engine.elegibilityTrace;
    const xε = this.engine.extendedElegibilityTrace;

    // unit sets
    const inputSet = this.engine.inputSet;
    const gatedBy = this.engine.gatedBy;
    const inputsOfGatedBy = this.engine.inputsOfGatedBy;

    // this is only for input neurons (they receive their activation from the environment)
    if (typeof input !== 'undefined') {

      y[j] = input;

    } else {

      // eq. 15
      s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputSet[j], i => g[j][i] * w[j][i] * y[i]); // compute state of j

      // eq. 16
      y[j] = f(j); // compute activation of j

      for (let i of inputSet[j]) { // comupute elegibility traces for j's inputs

        // eq. 17
        ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i];

        for (let k of gatedBy[j]) { // compute extended elegibility traces for j's inputs

          // eq. 18
          xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df(j) * ε[j][i] * this.bigParenthesisTerm(k, j);
        }
      }

      // update the gain of the connections gated by this unit with its activation value

      for (let to of gatedBy[unit]) {
        for (let from of inputsOfGatedBy[to][unit]) {
          // eq. 14
          g[to][from] = y[unit];
        }
      }
    }

    // return the activation of this unit
    return y[j];
  }

  propagateUnit(unit: number, target?: number) {
    // glosary
    const j = unit;
    // const s = this.engine.state
    const w = this.engine.weight;
    const g = this.engine.gain;
    const y = this.engine.activation;
    const df = this.activationFunctionDerivative;
    const δ = this.engine.errorResponsibility;
    const δP = this.engine.projectedErrorResponsibility;
    const δG = this.engine.gatedErrorResponsibility;
    const α = this.engine.learningRate;
    const ε = this.engine.elegibilityTrace;
    const xε = this.engine.extendedElegibilityTrace;
    const P = this.engine.projectionSet;
    const G = this.engine.gateSet;

    // unit sets
    const inputSet = this.engine.inputSet;

    // step 1: compute error responsibiltity (δ) for j

    if (typeof target !== 'undefined') { // this is only for output neurons, the error is injected from the environment

      // eq. 10
      δ[j] = δP[j] = target - y[j];

    } else { // for the rest of the units the error is computed by backpropagation

      // eq. 21
      δP[j] = df(j) * Σ(P[j], k => δ[k] * g[k][j] * w[k][j]);

      // eq. 22
      δG[j] = df(j) * Σ(G[j], k => δ[k] * this.bigParenthesisTerm(k, j));

      // eq. 23
      δ[j] = δP[j] + δG[j];

    }

    // step 2: compute deltas (Δw) and adjust the weights for all the inputs of j

    for (let i of inputSet[j]) {

      // eq. 24
      const Δw = α * δP[j] * ε[j][i] + α * Σ(G[j], k => δ[k] * xε[j][i][k]);

      // adjust the weights using delta
      w[j][i] += Δw;
    }
  }

  /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
  bigParenthesisTerm(k: number, j: number) {
    // glosary
    const w = this.engine.weight;
    const s = this.engine.state;
    const y = this.engine.activation;
    const dt = this.engine.derivativeTerm[k][j]; // the derivative term is 1 if and only if j gates k's self-connection, otherwise is 0
    const units = this.engine.inputsOfGatedBy[k][j]; // this index runs over all the inputs of k, that are gated by j

    // big parenthesis term
    return dt * w[k][k] * s[k] + Σ(units.filter(a => a !== k), a => w[k][a] * y[a]);
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
        const inputUnitWithHigherActivation = inputsOfGatedUnit.reduce((found, each) => this.engine.activation[each] === maxActivation ? each : found, null);
        return inputUnitWithHigherActivation === inputUnit ? 1 : 0;

      case ActivationTypes.DROPOUT:
        const chances = this.engine.state[unit];
        return this.engine.random() < chances && this.engine.status === StatusTypes.TRAINING ? 0 : 1;

      case ActivationTypes.EXP:
        return Math.exp(this.engine.state[unit]);

      case ActivationTypes.INVERSE_IDENTITY:
        return 1 / this.engine.state[unit];
    }
  }

  activationFunctionDerivative(unit: number) {
    let x: number;
    const type = this.engine.activationFunction[unit];
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.activationFunction(unit);
        return x * (1 - x);

      case ActivationTypes.TANH:
        x = this.activationFunction(unit);
        return 1 - Math.pow(x, 2);
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
    const activations = this.engine.layers.map((layer, layerIndex) => {
      return layer.map((unit, unitIndex) => {
        const input = layerIndex === 0 ? inputs[unitIndex] : void 0; // only units in the input layer receive an input
        return this.activateUnit(unit, input);
      });
    });
    this.engine.status = StatusTypes.IDLE;
    return activations.pop(); // return activation of the last layer (aka output layer)
  }

  propagate(targets: number[]) {
    this.engine.status = StatusTypes.PROPAGATING;
    this.engine.layers
      .slice(1) // input layer doesn't propagate
      .reverse() // layers propagate in reverse order
      .forEach((layer, layerIndex) => {
        layer
          .slice()
          .reverse() // units get propagated in reverse order
          .forEach((unit, unitIndex) => {
            const target = layerIndex === 0 ? targets[unitIndex] : void 0; // only units in the output layer receive a target
            this.propagateUnit(unit, target);
          });
      });
    this.engine.status = StatusTypes.IDLE;
  }

  train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction }) {
    return new Promise(resolve => {

      // start training
      let startTime = new Date().getTime();
      let error = Infinity;
      let iterations = 0;

      this.engine.learningRate = learningRate;
      this.engine.status = StatusTypes.TRAINING;

      // train
      while (error > minError && iterations < maxIterations) {
        error = 0;
        for (let data of dataset) {
          const { input, output } = data;
          const predictedOutput = this.activate(input);
          this.propagate(output);
          error += this.costFunction(output, predictedOutput, costFunction);
        }
        error /= dataset.length;
        iterations++;
      }

      // end training
      this.engine.status = StatusTypes.IDLE;
      resolve({
        error,
        iterations,
        time: new Date().getTime() - startTime
      });
    });
  }
}

// --

// helper for doing summations
function Σ(indexes: number[], fn: (num: number) => number) {
  return indexes.reduce((sum, value) => sum + fn(value), 0);
}
