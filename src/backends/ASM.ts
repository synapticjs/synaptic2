declare var global, console

// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

import Engine, { ActivationTypes, StatusTypes } from '../Engine'
import { CostTypes } from '../Trainer'
import { TrainEntry, Dictionary, Backend, TrainOptions, TrainResult } from '.'

export type Statement = Variable | string
export type Variables = Dictionary<Variable>
export class Variable {
  constructor(
    public id: number,
    public key: string,
    public value: number
  ) { }
}
export type AsmModule = {
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
}

export default class ASM implements Backend {

  id: number = 0
  heap: ArrayBuffer = null
  view: Float64Array = null
  inputs: number[] = []
  outputs: number[] = []
  targets: number[] = []
  variables: Variables = {}
  activationStatements: Statement[][] = []
  propagationStatements: Statement[][] = []
  asm: AsmModule = null
  learningRateId: number = null
  constructor(public engine = new Engine()) { }

  alloc(key: string, value: number): Variable {
    if (!(key in this.variables)) {
      this.variables[key] = new Variable(this.id++, key, value)
    }
    return this.variables[key]
  }

  buildActivationStatement(...parts: Statement[]) {
    this.activationStatements.push(parts)
  }

  buildPropagationStatement(...parts: Statement[]) {
    this.propagationStatements.push(parts)
  }

  buildActivateUnit(j: number): Variable {
    const activationJ = this.alloc(`activation[${j}]`, this.engine.activation[j])
    let i, k, h, g, l, a, to, from

    const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
    const isSelfConnected = this.engine.connections.some(connection => connection.to === j && connection.from === j)
    const isSelfConnectionGated = this.engine.gates.some(gate => gate.to === j && gate.from === j)

    if (isSelfConnected && isSelfConnectionGated) {
      const gainJJ = this.alloc(`gain[${j}][${j}]`, this.engine.gain[j][j])
      const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
      this.buildActivationStatement(stateJ, '*=', gainJJ, '*', weightJJ)
    } else if (isSelfConnected) {
      const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
      this.buildActivationStatement(stateJ, '*=', weightJJ)
    } else {
      this.buildActivationStatement(stateJ, '=', '0.0')
    }

    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      const isGated = this.engine.gates.some(gate => gate.from === i && gate.to === j)
      if (isGated) {
        const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
        const gainJI = this.alloc(`gain[${j}][${i}]`, this.engine.gain[j][i])
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
        this.buildActivationStatement(stateJ, '+=', gainJI, '*', weightJI, '*', activationI)
      } else {
        const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
        this.buildActivationStatement(stateJ, '+=', weightJI, '*', activationI)
      }
    }

    const derivativeJ = this.alloc(`derivative[${j}]`, this.engine.derivative[j])
    const type = this.engine.activationFunction[j]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        this.buildActivationStatement(activationJ, '=', '1.0', '/', '(1.0', '+', '(+exp(-', stateJ, ')))')
        this.buildActivationStatement(derivativeJ, '=', activationJ, '*', '(', '1.0', '-(+', activationJ, '))')
        break
      case ActivationTypes.TANH:
        const eP = this.alloc('eP', null)
        const eN = this.alloc('eN', null)
        this.buildActivationStatement(eP, '=', '(+exp(', stateJ, '))')
        this.buildActivationStatement(activationJ, '=', '(', '(+', eP, ')', '-', '(+', eN, ')', ')', '/', '(', '(+', eP, ')', '+', '(+', eN, ')', ')')
        this.buildActivationStatement(derivativeJ, '=', '1.0', '-', '(+pow(', activationJ, ',', '2.0', '))')
        break
      case ActivationTypes.RELU:
        this.buildActivationStatement(activationJ, '=', stateJ, '>', '0.0', '?', stateJ, ':', '0.0')
        break
      case ActivationTypes.IDENTITY:
        this.buildActivationStatement(activationJ, '=', stateJ)
        break
      /*case ActivationTypes.MAX_POOLING:
        const inputUnit = this.engine.inputsOf[unit][0]
        const gatedUnit = this.engine.gatedBy[unit][0]
        const inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit]
        const maxActivation = inputsOfGatedUnit.reduce((max, input) => Math.max(this.engine.activation[input], max), -Infinity)
        const inputUnitWithHigherActivation = inputsOfGatedUnit.find(input => this.engine.activation[input] === maxActivation)
        return inputUnitWithHigherActivation === inputUnit ? 1 : 0*/
      /*case ActivationTypes.DROPOUT:
        const chances = this.engine.state[unit]
        return this.engine.random() < chances && this.engine.status === StatusTypes.TRAINING ? 0 : 1*/
    }

    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      const gainJI = this.alloc(`gain[${j}][${i}]`, this.engine.gain[j][i])
      const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
      const elegibilityTraceJI = this.alloc(`elegibilityTrace[${j}][${i}]`, this.engine.elegibilityTrace[j][i])

      if (isSelfConnected && isSelfConnectionGated) {
        const gainJJ = this.alloc(`gain[${j}][${j}]`, this.engine.gain[j][j])
        const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
        this.buildActivationStatement(elegibilityTraceJI, '=', gainJJ, '*', weightJJ, '*', elegibilityTraceJI, '+', gainJI, '*', activationI)
      } else if (isSelfConnected) {
        const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
        this.buildActivationStatement(elegibilityTraceJI, '=', weightJJ, '*', elegibilityTraceJI, '+', gainJI, '*', activationI)
      } else {
        this.buildActivationStatement(elegibilityTraceJI, '=', gainJI, '*', activationI)
      }

      for (g = 0; g < this.engine.gatedBy[j].length; g++) {
        k = this.engine.gatedBy[j][g]

        const isSelfConnectedK = this.engine.connections.some(connection => connection.to === k && connection.from === k)
        // const isSelfConnectionGatedK = this.engine.gates.some(gate => gate.to === k && gate.from === k)

        /*const derivativeJ = this.alloc(`derivative[${j}]`, this.engine.derivative[j])
        const type = this.engine.activationFunction[j]
        switch (type) {
          case ActivationTypes.LOGISTIC_SIGMOID:
            this.buildActivationStatement(derivativeJ, '=', activationJ, '*', '(', '1.0', '-', activationJ, ')')
            break
          case ActivationTypes.TANH:
            this.buildActivationStatement(derivativeJ, '=', '1.0', '-', '(+pow', '(', activationJ, ',', '2.0', '))')
            break
          case ActivationTypes.RELU:
          case ActivationTypes.IDENTITY:
          case ActivationTypes.MAX_POOLING:
          case ActivationTypes.DROPOUT:
            break
        }*/

        const bigParenthesisTermResult = this.alloc('bigParenthesisTermResult', null)

        let keepBigParenthesisTerm = false
        let initializeBigParenthesisTerm = false
        if (isSelfConnectedK && this.engine.derivativeTerm[k][j]) {
          const stateK = this.alloc(`state[${k}]`, this.engine.state[k])
          this.buildActivationStatement(bigParenthesisTermResult, '=', stateK)
          keepBigParenthesisTerm = true
        } else {
          initializeBigParenthesisTerm = true
        }


        for (l = 0; l < this.engine.inputsOfGatedBy[k][j].length; l++) {
          a = this.engine.inputsOfGatedBy[k][j][l]
          if (a !== k) {
            if (initializeBigParenthesisTerm) {
              this.buildActivationStatement(bigParenthesisTermResult, '=', '0.0')
              initializeBigParenthesisTerm = false
            }
            const weightKA = this.alloc(`weight[${k}][${a}]`, this.engine.weight[k][a])
            const activationA = this.alloc(`activation[${a}]`, this.engine.activation[a])
            this.buildActivationStatement(bigParenthesisTermResult, '+=', weightKA, '*', activationA)
            keepBigParenthesisTerm = true
          }
        }

        const extendedElegibilityTraceJIK = this.alloc(`extendedElegibilityTrace[${j}][${i}][${k}]`, this.engine.extendedElegibilityTrace[j][i][k])

        if (isSelfConnected && isSelfConnectionGated) {
          const gainKK = this.alloc(`gain[${k}][${k}]`, this.engine.gain[k][k])
          const weightKK = this.alloc(`weight[${k}][${k}]`, this.engine.weight[k][k])
          if (keepBigParenthesisTerm) {
            this.buildActivationStatement(extendedElegibilityTraceJIK, '=', gainKK, '*', weightKK, '*', extendedElegibilityTraceJIK, '+', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult)
          } else {
            this.buildActivationStatement(extendedElegibilityTraceJIK, '=', gainKK, '*', weightKK, '*', extendedElegibilityTraceJIK)
          }
        } else if (isSelfConnected) {
          const weightKK = this.alloc(`weight[${k}][${k}]`, this.engine.weight[k][k])
          if (keepBigParenthesisTerm) {
            this.buildActivationStatement(extendedElegibilityTraceJIK, '=', weightKK, '*', extendedElegibilityTraceJIK, '+', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult)
          } else {
            this.buildActivationStatement(extendedElegibilityTraceJIK, '=', weightKK, '*', extendedElegibilityTraceJIK)
          }
        } else {
          if (keepBigParenthesisTerm) {
            this.buildActivationStatement(extendedElegibilityTraceJIK, '=', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult)
          }
        }
      }
    }

    for (h = 0; h < this.engine.gatedBy[j].length; h++) {
      to = this.engine.gatedBy[j][h]
      for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
        from = this.engine.inputsOfGatedBy[to][j][g]
        const gainToFrom = this.alloc(`gain[${to}][${from}]`, this.engine.gain[to][from])
        this.buildActivationStatement(gainToFrom, '=', activationJ)
      }
    }

    return activationJ
  }

  buildPropagateUnit(j: number, target?: Variable) {
    let i, k, h, g, l, a
    let hasProjectedError = this.engine.projectionSet[j].length > 0
    const hasGatedError = this.engine.gateSet[j].length > 0
    if (typeof target !== 'undefined') {
      hasProjectedError = true
      const errorResponsibilityJ = this.alloc(`errorResponsibility[${j}]`, this.engine.errorResponsibility[j])
      const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
      const activationJ = this.alloc(`activation[${j}]`, this.engine.activation[j])
      this.buildPropagationStatement(errorResponsibilityJ, '=', projectedErrorResponsibilityJ, '=', '(+', target, ')', '-', '(+', activationJ, ')')
    } else {
      const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
      if (hasProjectedError) {
        this.buildPropagationStatement(projectedErrorResponsibilityJ, '=', '0.0')
      }
      for (h = 0; h < this.engine.projectionSet[j].length; h++) {
        k = this.engine.projectionSet[j][h]
        const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
        const isGated = this.engine.gates.some(gate => gate.to === k && gate.from === j)
        if (isGated) {
          const gainKJ = this.alloc(`gain[${k}][${j}]`, this.engine.gain[k][j])
          const weightKJ = this.alloc(`weight[${k}][${j}]`, this.engine.weight[k][j])
          this.buildPropagationStatement(projectedErrorResponsibilityJ, '+=', errorResponsibilityK, '*', gainKJ, '*', weightKJ)
        } else {
          const weightKJ = this.alloc(`weight[${k}][${j}]`, this.engine.weight[k][j])
          this.buildPropagationStatement(projectedErrorResponsibilityJ, '+=', errorResponsibilityK, '*', weightKJ)
        }
      }
      const derivativeJ = this.alloc(`derivative[${j}]`, this.engine.derivative[j])
      if (hasProjectedError) {
        this.buildPropagationStatement(projectedErrorResponsibilityJ, '*=', derivativeJ)
      }
      const gatedErrorResponsibilityJ = this.alloc(`gatedErrorResponsibility[${j}]`, this.engine.gatedErrorResponsibility[j])
      if (hasGatedError) {
        this.buildPropagationStatement(gatedErrorResponsibilityJ, '=', '0.0')
      }
      for (h = 0; h < this.engine.gateSet[j].length; h++) {
        k = this.engine.gateSet[j][h]
        const isSelfConnectedK = this.engine.connections.some(connection => connection.to === k && connection.from === k)
        const bigParenthesisTermResult = this.alloc('bigParenthesisTermResult', null)
        let keepBigParenthesisTerm = false
        let initializeBigParenthesisTerm = false
        if (isSelfConnectedK && this.engine.derivativeTerm[k][j]) {
          const stateK = this.alloc(`state[${k}]`, this.engine.state[k])
          this.buildActivationStatement(bigParenthesisTermResult, '=', stateK)
          keepBigParenthesisTerm = true
        } else {
          initializeBigParenthesisTerm = true
        }
        for (l = 0; l < this.engine.inputsOfGatedBy[k][j].length; l++) {
          a = this.engine.inputsOfGatedBy[k][j][l]
          if (a !== k) {
            if (initializeBigParenthesisTerm) {
              this.buildActivationStatement(bigParenthesisTermResult, '=', '0.0')
              initializeBigParenthesisTerm = false
            }
            const weightKA = this.alloc(`weight[${k}][${a}]`, this.engine.weight[k][a])
            const activationA = this.alloc(`activation[${a}]`, this.engine.activation[a])
            this.buildActivationStatement(bigParenthesisTermResult, '+=', weightKA, '*', activationA)
            keepBigParenthesisTerm = true
          }
        }
        if (keepBigParenthesisTerm) {
          const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
          this.buildPropagationStatement(gatedErrorResponsibilityJ, '+=', errorResponsibilityK, '*', bigParenthesisTermResult)
        }
      }
      if (hasGatedError) {
        this.buildPropagationStatement(gatedErrorResponsibilityJ, '*=', derivativeJ)
      }
      const errorResponsibilityJ = this.alloc(`errorResponsibility[${j}]`, this.engine.errorResponsibility[j])
      if (hasProjectedError && hasGatedError) {
        this.buildPropagationStatement(errorResponsibilityJ, '=', projectedErrorResponsibilityJ, '+', gatedErrorResponsibilityJ)
      } else if (hasProjectedError) {
        this.buildPropagationStatement(errorResponsibilityJ, '=', projectedErrorResponsibilityJ)
      } else if (hasGatedError) {
        this.buildPropagationStatement(errorResponsibilityJ, '=', gatedErrorResponsibilityJ)
      }
    }
    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      if (hasProjectedError && hasGatedError) {
        i = this.engine.inputSet[j][h]
        const Δw = this.alloc(`Δw`, null)
        const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
        const elegibilityTraceJI = this.alloc(`elegibilityTrace[${j}][${i}]`, this.engine.elegibilityTrace[j][i])
        this.buildPropagationStatement(Δw, '=', projectedErrorResponsibilityJ, '*', elegibilityTraceJI)
        for (g = 0; g < this.engine.gateSet[j].length; g++) {
          k = this.engine.gateSet[j][g]
          const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
          const extendedElegibilityTraceJIK = this.alloc(`errorResponsibility[${k}]`, this.engine.extendedElegibilityTrace[j][i][k])
          this.buildPropagationStatement(Δw, '+=', errorResponsibilityK, '*', extendedElegibilityTraceJIK)
        }
        const learningRate = this.alloc('learningRate', this.engine.learningRate)
        this.buildPropagationStatement(Δw, '*=', learningRate)
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        this.buildPropagationStatement(weightJI, '+=', Δw)
      } else if (hasProjectedError) {
        i = this.engine.inputSet[j][h]
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
        const elegibilityTraceJI = this.alloc(`elegibilityTrace[${j}][${i}]`, this.engine.elegibilityTrace[j][i])
        const learningRate = this.alloc('learningRate', this.engine.learningRate)
        this.buildPropagationStatement(weightJI, '+=', projectedErrorResponsibilityJ, '*', elegibilityTraceJI, '*', learningRate)
      } else if (hasGatedError) {
        i = this.engine.inputSet[j][h]
        const Δw = this.alloc(`Δw`, null)
        this.buildPropagationStatement(Δw, '=', '0.0')
        for (g = 0; g < this.engine.gateSet[j].length; g++) {
          k = this.engine.gateSet[j][g]
          const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
          const extendedElegibilityTraceJIK = this.alloc(`errorResponsibility[${k}]`, this.engine.extendedElegibilityTrace[j][i][k])
          this.buildPropagationStatement(Δw, '+=', errorResponsibilityK, '*', extendedElegibilityTraceJIK)
        }
        const learningRate = this.alloc('learningRate', this.engine.learningRate)
        this.buildPropagationStatement(Δw, '*=', learningRate)
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        this.buildPropagationStatement(weightJI, '+=', Δw)
      }
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

  buildBody(statements: Statement[][]): string {
    return statements.map(statement => statement.map(x => x instanceof Variable ? `H[${x.id}]` : x).join('')).join(';\n\t')
  }

  buildAsm(): AsmModule {
    this.id = 0
    this.inputs = []
    this.outputs = []
    this.targets = []
    this.learningRateId = this.alloc(`learningRate`, this.engine.learningRate).id
    this.variables = {}
    this.activationStatements = []
    this.propagationStatements = []
    let outputLayerIndex = this.engine.layers.length - 1
    if (this.engine.biasUnit !== null) {
      this.alloc(`activation[${this.engine.biasUnit}]`, this.engine.activation[this.engine.biasUnit])
    }
    for (let i = 0; i < this.engine.layers.length; i++) {
      for (let j = 0; j < this.engine.layers[i].length; j++) {
        let activationJ
        switch (i) {
          case 0:
            activationJ = this.alloc(`activation[${this.engine.layers[i][j]}]`, this.engine.activation[this.engine.layers[i][j]])
            this.inputs.push(activationJ.id)
            break
          case outputLayerIndex:
            activationJ = this.buildActivateUnit(this.engine.layers[i][j])
            this.outputs.push(activationJ.id)
            break
          default:
            this.buildActivateUnit(this.engine.layers[i][j])
        }
      }
    }
    for (let j = this.engine.layers[outputLayerIndex].length - 1; j >= 0; j--) {
      let targetJ = this.alloc(`target[${j}]`, null)
      this.targets.push(targetJ.id)
      this.buildPropagateUnit(this.engine.layers[outputLayerIndex][j], targetJ)
    }
    for (let i = this.engine.layers.length - 2; i > 0; i--) {
      for (let j = this.engine.layers[i].length - 1; j >= 0; j--) {
        this.buildPropagateUnit(this.engine.layers[i][j])
      }
    }

    this.heap = new ArrayBuffer(this.id * 8)
    this.view = new Float64Array(this.heap)
    Object.keys(this.variables).forEach(key => {
      const variable = this.variables[key]
      if (typeof variable.value === 'number') {
        this.view[variable.id] = variable.value
      }
    })
    const activationBody = this.buildBody(this.activationStatements)
    const propagationBody = this.buildBody(this.propagationStatements)
    const source = `
function module(stdlib, foreign, heap) {
  "use asm";
  var H = new stdlib.Float64Array(heap);
  var exp = stdlib.Math.exp;
  var pow = stdlib.Math.pow;
  var random = foreign.random;
  function activate() {
    ${activationBody}
  }
  function propagate() {
    ${propagationBody}
  }
  return {
    activate: activate,
    propagate: propagate
  }
}
return { module: module }`
    const constructor = new Function(source)
    console.log(source)
    const module = constructor().module
    const foreign = { random: this.engine.random }
    const asm = module(global, foreign, this.heap)
    return {
      activate: (inputs: number[]) => {
        for (let i = 0; i < this.inputs.length; i++) {
          this.view[this.inputs[i]] = inputs[i]
        }
        asm.activate()
        let activation = new Array(this.outputs.length)
        for (let i = 0; i < this.outputs.length; i++) {
          activation[i] = this.view[this.outputs[i]]
        }
        return activation
      },
      propagate: (targets: number[]) => {
        for (let i = 0; i < this.targets.length; i++) {
          this.view[this.targets[i]] = targets[i]
        }
        this.view[this.learningRateId] = this.engine.learningRate
        asm.propagate()
      }
    }
  }

  syncProp(id: string, dimensions: number, parent: any = this.engine, key: string = id) {
    if (dimensions > 0) {
      for (let propKey in parent[key]) {
        this.syncProp(`${id}[${propKey}]`, dimensions - 1, parent[key], propKey)
      }
    } else {
      const variable = this.variables[id]
      if (variable) { // not all the properties in the engine are in the heap (ie. the state of the input units)
        parent[key] = this.view[variable.id]
      }
    }
  }

  sync() {
    if (this.asm) {
      this.syncProp('state', 1)
      this.syncProp('weight', 2)
      this.syncProp('gain', 2)
      this.syncProp('activation', 1)
      this.syncProp('derivative', 1)
      this.syncProp('elegibilityTrace', 2)
      this.syncProp('extendedElegibilityTrace', 3)
      this.syncProp('errorResponsibility', 1)
      this.syncProp('projectedErrorResponsibility', 1)
      this.syncProp('gatedErrorResponsibility', 1)
    }
  }

  activate(inputs: number[]): number[] {
    const oldStatus = this.engine.status
    this.engine.status = StatusTypes.ACTIVATING
    if (this.asm == null) {
      this.asm = this.buildAsm()
    }
    const activation = this.asm.activate(inputs)
    this.engine.status = oldStatus
    if (this.engine.status !== StatusTypes.TRAINING) {
      this.sync()
    }
    return activation
  }

  propagate(targets: number[]) {
    const oldStatus = this.engine.status
    this.engine.status = StatusTypes.PROPAGATING
    this.asm.propagate(targets)
    this.engine.status = oldStatus
    if (this.engine.status !== StatusTypes.TRAINING) {
      this.sync()
    }
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

    // sync heap with engine
    this.sync()

    // end training
    this.engine.status = StatusTypes.IDLE

    return {
      error,
      iterations,
      time: new Date().getTime() - startTime
    }
  }
}
