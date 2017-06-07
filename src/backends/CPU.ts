import { ActivationTypes, StatusTypes } from 'lysergic';
import { Backend, activationFunction, activationFunctionDerivative } from './Backend';
declare var console;

export class CPU extends Backend {
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
  private bigParenthesisTerm(k: number, j: number) {
    let result = this.engine.derivativeTerm[k][j] * this.engine.weight[k][k] * this.engine.state[k];
    for (let i = 0; i < this.engine.inputsOfGatedBy[k][j].length; i++) {
      let a = this.engine.inputsOfGatedBy[k][j][i];
      if (a !== k) {
        result += this.engine.weight[k][a] * this.engine.activation[a];
      }
    }
    return result;
  }

  private activationFunction(unit: number): number {
    const x: number = this.engine.state[unit];
    const type = this.engine.activationFunction[unit];

    switch (type) {
      case ActivationTypes.MAX_POOLING:
        const inputUnit = this.engine.inputsOf[unit][0];
        const gatedUnit = this.engine.gatedBy[unit][0];
        const inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit];

        const allActivations = inputsOfGatedUnit.map($ => this.engine.activation[$]);
        const maxActivation = Math.max(...allActivations);

        const inputUnitWithHigherActivation = inputsOfGatedUnit.reduce((found, unit) => this.engine.activation[unit] === maxActivation ? unit : found, null);
        return inputUnitWithHigherActivation === inputUnit ? 1 : 0;

      case ActivationTypes.DROPOUT:
        const chances = x;

        if (this.engine.random() < chances && this.engine.status === StatusTypes.TRAINING) {
          return 0;
        } else {
          return 1;
        }
      default:
        return activationFunction(x, type);
    }
  }

  private activationFunctionDerivative(unit: number) {
    const x: number = this.engine.state[unit];
    const fx: number = this.engine.activation[unit];

    const type = this.engine.activationFunction[unit];

    switch (type) {
      case ActivationTypes.MAX_POOLING:
        return 0;
      case ActivationTypes.DROPOUT:
        return 0;
      default:
        return activationFunctionDerivative(x, fx, type);
    }
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

  async activate(inputs: number[]) {
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


  async propagate(targets: number[]) {
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
}

declare var module;

export default CPU;

console.log('BCPU', CPU, module.default);