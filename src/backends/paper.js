// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

import Engine, { ActivationTypes } from '../engine'

export default class PaperBackend {

  constructor (engine) {
    this.engine = engine || new Engine()
  }

  activate (layer, input) {
    return layer.map((unit) =>
      // glosary
      const j = unit
      const s = this.engine.state
      const w = this.engine.weight
      const g = this.engine.gain
      const y = this.engine.activation
      const f = this.activationFunction
      const df = this.activationFunctionDerivative
      const ε = this.engine.elegibilityTrace
      const xε = this.engine.extendedElegibilityTrace

      // unit sets
      const inputSet = this.engine.inputSet
      const gatedBy = this.engine.gatedBy
      const inputsOfGatedBy = this.engine.inputsOfGatedBy

      // this is only for input neurons (they receive their activation from the environment)
      if (typeof input !== 'undefined') {

        y[j] = input

      } else {

        // eq. 15
        s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputSet[j], i => g[j][i] * w[j][i] * y[i]) // compute state of j

        // eq. 16
        y[j] = f(j) // compute activation of j

        for (const i of inputSet[j]) { // comupute elegibility traces for j's inputs

          // eq. 17
          ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i]

          for (const k of gatedBy[j]) { // compute extended elegibility traces for j's inputs

            // eq. 18
            xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df(j) * ε[j][i] * this.bigParenthesisTerm(k, j)
          }
        }

        // update the gain of the connections gated by this unit with its activation value
        for (const to of gatedBy[unit]) {
          for (const from of inputsOfGatedBy[to][unit]) {
            // eq. 14
            g[to][from] = y[unit]
          }
        }
      }

      // return the activation of this unit
      return y[j]
    })
  }

  propagate (layer, target) {
    for (const unit of layer) {
      // glosary
      const j = unit
      const s = this.engine.state
      const w = this.engine.weight
      const g = this.engine.gain
      const y = this.engine.activation
      const df = this.activationFunctionDerivative
      const δ = this.engine.errorResponsibility
      const δP = this.engine.projectedErrorResponsibility
      const δG = this.engine.gatedErrorResponsibility
      const α = this.engine.learningRate
      const ε = this.engine.elegibilityTrace
      const xε = this.engine.extendedElegibilityTrace
      const P = this.engine.projectionSet
      const G = this.engine.gateSet

      // unit sets
      const inputSet = this.engine.inputSet

      // step 1: compute error responsibiltity (δ) for j

      if (typeof target !== 'undefined') { // this is only for output neurons, the error is injected from the environment

        // eq. 10
        δ[j] = δP[j] = target - y[j]

      } else { // for the rest of the units the error is computed by backpropagation

        // eq. 21
        δP[j] = df(j) * Σ(P[j], k => δ[k] * g[k][j] * w[k][j])

        // eq. 22
        δG[j] = df(j) * Σ(G[j], k => δ[k] * this.bigParenthesisTerm(k, j))

        // eq. 23
        δ[j] = δP[j] + δG[j]

      }

      // step 2: adjust the weights (Δw) for all the inputs of j

      for (const i of inputSet[j]) {
        // eq. 24
        w[j][i] += α * δP[j] * ε[j][i] + α * Σ(G[j], k => δ[k] * xε[j][i][k])
      }
    }
  },

  train (dataset) {
    // TODO:
  }

  // this calculate the big parenthesis term that is present in eq. 18 and eq. 22
  bigParenthesisTerm (k, j) {
    // glosary
    const w = this.engine.weight
    const s = this.engine.state
    const y = this.engine.activation
    const dt = this.engine.derivativeTerm[k][j] // the derivative term is 1 if and only if j gates k's self-connection, otherwise is 0
    const gatedInputs = this.engine.inputsOfGatedBy[k][j] // this index runs over all the inputs of k, that are gated by j

    // big parenthesis term
    return dt * w[k][k] * s[k] + Σ(gatedInputs, a => w[k][a] * y[a])
  },

  activationFunction (unit) {
    let x
    const type = this.engine.activationFunction[unit]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.engine.state[unit]
        return 1 / (1 + Math.exp(-x))

      case ActivationTypes.TANH:
        x = this.engine.state[unit]
        const eP = Math.exp(x);
        const eN = 1 / eP;
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
        const inputUnitWithHigherActivation = inputsOfGatedUnit.find(input => this.engine.activation[input] === maxActivation)
        return inputWithHigherActivation === inputUnit ? 1 : 0

      case ActivationTypes.DROPOUT:
        const chances = this.engine.state[unit]
        return this.engine.random() < chances && this.engine.training ? 0 : 1
    }
  }

  activationFunctionDerivative (unit) {
    let x
    const type = this.engine.activationFunction[unit]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        x = this.activationFunction(unit)
        return x * (1 - x)

      case ActivationTypes.TANH:
        x = this.activationFunction(unit)
        return 1 - Math.pow(x, 2);

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
}

// helper for doing summations
function Σ (indexes, fn) {
  return indexes.reduce((sum, index) => sum + fn(index), 0)
}
