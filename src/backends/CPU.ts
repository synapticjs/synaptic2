// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

import Engine, { ActivationTypes, StatusTypes } from '../Engine'
import { CostTypes } from '../Trainer'
import { TrainEntry, Backend, TrainOptions, TrainResult } from '.'

export default class CPU implements Backend {
  constructor(public engine = new Engine()) {

  }

  activateUnit(j: number): number {
    let i, k, h, g, to, from
    this.engine.state[j] *= this.engine.gain[j][j] * this.engine.weight[j][j]
    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      this.engine.state[j] += this.engine.gain[j][i] * this.engine.weight[j][i] * this.engine.activation[i]
    }

    this.engine.activation[j] = this.activationFunction(j)
    this.engine.derivative[j] = this.activationFunctionDerivative(j)

    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      this.engine.elegibilityTrace[j][i] = this.engine.gain[j][j] * this.engine.weight[j][j] * this.engine.elegibilityTrace[j][i] + this.engine.gain[j][i] * this.engine.activation[i]
      for (g = 0; g < this.engine.gatedBy[j].length; g++) {
        k = this.engine.gatedBy[j][g]
        this.engine.extendedElegibilityTrace[j][i][k] = this.engine.gain[k][k] * this.engine.weight[k][k] * this.engine.extendedElegibilityTrace[j][i][k] + this.engine.derivative[j] * this.engine.elegibilityTrace[j][i] * this.bigParenthesisTerm(k, j)
      }
    }

    for (h = 0; h < this.engine.gatedBy[j].length; h++) {
      to = this.engine.gatedBy[j][h]
      for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
        from = this.engine.inputsOfGatedBy[to][j][g]
        this.engine.gain[to][from] = this.engine.activation[j]
      }
    }


    return this.engine.activation[j]
  }

  propagateUnit(j: number, target?: number) {
    let i, k, h, g, engine = this.engine
    if (typeof target !== 'undefined') {

      engine.errorResponsibility[j] = engine.projectedErrorResponsibility[j] = target - engine.activation[j]

    } else {
      engine.projectedErrorResponsibility[j] = 0
      for (h = 0; h < engine.projectionSet[j].length; h++) {
        k = engine.projectionSet[j][h]
        engine.projectedErrorResponsibility[j] += engine.errorResponsibility[k] * engine.gain[k][j] * engine.weight[k][j]
      }
      engine.projectedErrorResponsibility[j] *= engine.derivative[j]

      engine.gatedErrorResponsibility[j] = 0
      for (h = 0; h < engine.gateSet[j].length; h++) {
        k = engine.gateSet[j][h]
        engine.gatedErrorResponsibility[j] += engine.errorResponsibility[k] * this.bigParenthesisTerm(k, j)
      }
      engine.gatedErrorResponsibility[j] *= engine.derivative[j]

      engine.errorResponsibility[j] = engine.projectedErrorResponsibility[j] + engine.gatedErrorResponsibility[j]

    }
    for (h = 0; h < engine.inputSet[j].length; h++) {
      i = engine.inputSet[j][h]
      let Δw = engine.projectedErrorResponsibility[j] * engine.elegibilityTrace[j][i]
      for (g = 0; g < engine.gateSet[j].length; g++) {
        k = engine.gateSet[j][g]
        Δw += engine.errorResponsibility[k] * engine.extendedElegibilityTrace[j][i][k]
      }
      Δw *= engine.learningRate
      engine.weight[j][i] += Δw
    }
  }

  /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
  bigParenthesisTerm(k: number, j: number) {
    let result = this.engine.derivativeTerm[k][j] * this.engine.weight[k][k] * this.engine.state[k]
    for (var i = 0; i < this.engine.inputsOfGatedBy[k][j].length; i++) {
      var a = this.engine.inputsOfGatedBy[k][j][i]
      if (a !== k) {
        result += this.engine.weight[k][a] * this.engine.activation[a]
      }
    }
    return result
  }

  activationFunction(unit: number): number {
    let x
    const type = this.engine.activationFunction[unit]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.engine.state[unit]
        return 1 / (1 + Math.exp(-x))

      case ActivationTypes.TANH:
        x = this.engine.state[unit]
        const eP = Math.exp(x)
        const eN = 1 / eP
        return (eP - eN) / (eP + eN)

      case ActivationTypes.RELU:
        x = this.engine.state[unit]
        return x > 0 ? x : 0

      case ActivationTypes.IDENTITY:
        x = this.engine.state[unit]
        return x

      case ActivationTypes.MAX_POOLING:
        const inputUnit = this.engine.inputsOf[unit][0]
        const gatedUnit = this.engine.gatedBy[unit][0]
        const inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit]
        const maxActivation = inputsOfGatedUnit.reduce((max, input) => Math.max(this.engine.activation[input], max), -Infinity)
        const inputUnitWithHigherActivation = inputsOfGatedUnit.reduce((found, unit) => this.engine.activation[unit] === maxActivation ? unit : found, null)
        return inputUnitWithHigherActivation === inputUnit ? 1 : 0

      case ActivationTypes.DROPOUT:
        const chances = this.engine.state[unit]
        return this.engine.random() < chances && this.engine.status === StatusTypes.TRAINING ? 0 : 1
    }
  }

  activationFunctionDerivative(unit: number) {
    let x: number
    const type = this.engine.activationFunction[unit]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.engine.activation[unit]
        return x * (1 - x)

      case ActivationTypes.TANH:
        x = this.engine.activation[unit]
        return 1 - Math.pow(x, 2)

      case ActivationTypes.RELU:
        return 0

      case ActivationTypes.IDENTITY:
        return 0

      case ActivationTypes.MAX_POOLING:
        return 0

      case ActivationTypes.DROPOUT:
        return 0
    }
  }

  costFunction(target: number[], predicted: number[], costType: CostTypes) {
    let i: number, x = 0
    switch (costType) {
      case CostTypes.MEAN_SQUARE_ERROR:
        for (i = 0; i < target.length; i++) {
          x += Math.pow(target[i] - predicted[i], 2)
        }
        return x / target.length

      case CostTypes.CROSS_ENTROPY:
        for (i = 0; i < target.length; i++) {
          x -= (target[i] * Math.log(predicted[i] + 1e-15)) + ((1 - target[i]) * Math.log((1 + 1e-15) - predicted[i])) // +1e-15 is a tiny push away to avoid Math.log(0)
        }
        return x

      case CostTypes.BINARY:
        for (i = 0; i < target.length; i++) {
          x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0
        }
        return x
    }
  }

  activate(inputs: number[]): number[] {
    this.engine.status = StatusTypes.ACTIVATING
    let outputLayerIndex = this.engine.layers.length - 1
    let activation = new Array(this.engine.layers[outputLayerIndex].length)

    for (let j = 0; j < this.engine.layers[0].length; j++) {
      this.engine.activation[this.engine.layers[0][j]] = inputs[j]
    }

    for (let layer = 1; layer < this.engine.layers.length - 1; layer++) {
      for (let j = 0; j < this.engine.layers[layer].length; j++) {
        this.activateUnit(this.engine.layers[layer][j])
      }
    }

    for (let j = 0; j < this.engine.layers[outputLayerIndex].length; j++) {
      activation[j] = this.activateUnit(this.engine.layers[outputLayerIndex][j])
    }

    this.engine.status = StatusTypes.IDLE
    return activation
  }

  propagate(targets: number[]) {
    this.engine.status = StatusTypes.PROPAGATING
    let outputLayerIndex = this.engine.layers.length - 1
    for (let j = this.engine.layers[outputLayerIndex].length - 1; j >= 0; j--) {
      this.propagateUnit(this.engine.layers[outputLayerIndex][j], targets[j])
    }
    for (let i = this.engine.layers.length - 2; i > 0; i--) {
      for (let j = this.engine.layers[i].length - 1; j >= 0; j--) {
        this.propagateUnit(this.engine.layers[i][j])
      }
    }
    this.engine.status = StatusTypes.IDLE
  }

  async train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction }: TrainOptions): Promise<TrainResult> {

    // start training
    let startTime = new Date().getTime()
    let error = Infinity
    let iterations = 0

    this.engine.learningRate = learningRate
    this.engine.status = StatusTypes.TRAINING

    // train
    while (error > minError && iterations < maxIterations) {
      error = 0
      for (let index = 0; index < dataset.length; index++) {
        const { input, output } = dataset[index]
        const predictedOutput = this.activate(input)
        this.propagate(output)
        error += this.costFunction(output, predictedOutput, costFunction)
      }
      error /= dataset.length
      iterations++
    }

    // end training
    this.engine.status = StatusTypes.IDLE
    return {
      error,
      iterations,
      time: new Date().getTime() - startTime
    }
  }
}
