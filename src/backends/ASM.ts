declare var console

// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

import Engine, { ActivationTypes, StatusTypes } from '../Engine'
import { CostTypes } from '../Trainer'
import { TrainEntry, Dictionary, Backend, TrainOptions, TrainResult } from '.'
import { DocumentNode, LayerNode, UnitNode, FunctionNode, HeapReferenceNode } from './AST/nodes'
import {
  document,
  assign,
  assignSum,
  assignMul,
  number,
  sum,
  sub,
  mul,
  neg,
  div,
  exp,
  pow,
  func,
  unit,
  layer,
  conditional,
  gt
} from './AST/operations'

export type Statement = Variable | string
export class Variable extends HeapReferenceNode {
  constructor(
    public id: number,
    public key: string,
    public initialValue: number
  ) {
    super(id)
  }
}

export type AsmModule = {
  module: any,
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
}

function asm(literals, ...placeholders: (Variable | string)[]) {
  let result = ""

  // interleave the literals with the placeholders
  for (let i = 0; i < placeholders.length; i++) {
    result += literals[i]
    let ph = placeholders[i]
    if (typeof ph == 'string' || i == 0) {
      if (typeof ph != 'string' && !result) {
        result += `H[${ph.id}]`
      } else {
        result += ph
      }
    } else {
      result += `(+H[${ph.id}])`
    }
  }

  // add the last literal
  result += literals[literals.length - 1]
  return result
}



export default class ASM implements Backend {

  id: number = 0
  heap: ArrayBuffer = null
  view: Float64Array = null
  learningRate: Variable = null
  seed: Variable = null
  inputs: Variable[] = []
  outputs: Variable[] = []
  targets: Variable[] = []
  variables: Dictionary<Variable> = {}
  document: DocumentNode = document()
  activationStatements: Statement[][] = []
  propagationStatements: Statement[][] = []
  asm: AsmModule = null
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

  buildActivateUnit(j: number, layerJ: number): Variable {

    let hasActivationFunction = this.document.children.some(node => node instanceof FunctionNode && node.name === 'activate')
    if (!hasActivationFunction) {
      this.document.addNode(func('activate'))
    }
    let activationFunction: FunctionNode = this.document.children.reduce<FunctionNode>((found, node) => node instanceof FunctionNode && node.name === 'activate' ? node : null, null)
    let hasLayer = activationFunction.children.some(node => node instanceof LayerNode && node.id === layerJ)
    if (!hasLayer) {
      activationFunction.addNode(layer(layerJ))
    }
    let layerNode: LayerNode = activationFunction.children.reduce<LayerNode>((found, node) => node instanceof LayerNode && node.id === layerJ ? node : null, null)
    let hasUnit = layerNode.children.some(node => node instanceof UnitNode && node.id === j)
    if (!hasUnit) {
      layerNode.addNode(unit(j))
    }
    const unitNode: UnitNode = layerNode.children.reduce<UnitNode>((found, node) => node instanceof UnitNode && node.id === j ? node : null, null)
    const statement = unitNode.addNode.bind(unitNode)

    const activationJ = this.alloc(`activation[${j}]`, this.engine.activation[j])
    let i, k, h, g, l, a, to, from

    const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
    const isSelfConnected = this.engine.connections.some(connection => connection.to === j && connection.from === j)
    const isSelfConnectionGated = this.engine.gates.some(gate => gate.to === j && gate.from === j)

    if (isSelfConnected && isSelfConnectionGated) {
      const gainJJ = this.alloc(`gain[${j}][${j}]`, this.engine.gain[j][j])
      const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
      this.buildActivationStatement(asm`${stateJ} = ${stateJ} * ${gainJJ} * ${weightJJ}`)
      statement(assignMul(stateJ, mul(gainJJ, weightJJ)))
    } else if (isSelfConnected) {
      const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
      this.buildActivationStatement(asm`${stateJ} = ${stateJ} * ${weightJJ}`)
      statement(assignMul(stateJ, weightJJ))
    } else {
      this.buildActivationStatement(asm`${stateJ} = 0.0`)
      statement(assign(stateJ, number(0)))
    }

    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      const isGated = this.engine.gates.some(gate => gate.from === i && gate.to === j)
      if (isGated) {
        const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
        const gainJI = this.alloc(`gain[${j}][${i}]`, this.engine.gain[j][i])
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
        this.buildActivationStatement(asm`${stateJ} = ${stateJ} + ${gainJI} * ${weightJI} * ${activationI}`)
        statement(assignSum(stateJ, mul(mul(gainJI, weightJI), activationI)))
      } else {
        const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
        this.buildActivationStatement(asm`${stateJ} = ${stateJ} + ${weightJI} * ${activationI}`)
        statement(assignSum(stateJ, mul(weightJI, activationI)))
      }
    }

    const derivativeJ = this.alloc(`derivative[${j}]`, this.engine.derivative[j])
    const type = this.engine.activationFunction[j]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        this.buildActivationStatement(asm`${activationJ} = 1.0 / (1.0 + exp(-${stateJ}))`)
        this.buildActivationStatement(asm`${derivativeJ} = ${activationJ} * (1.0 - ${activationJ})`)
        statement(assign(activationJ, div(number(1), sum(number(1), exp(neg(stateJ))))))
        statement(assign(derivativeJ, mul(activationJ, sub(number(1), activationJ))))
        break
      case ActivationTypes.TANH:
        const eP = this.alloc('eP', null)
        const eN = this.alloc('eN', null)
        this.buildActivationStatement(asm`${eP} = (+exp(${stateJ}))`)
        this.buildActivationStatement(asm`${activationJ} = (${eP} - ${eN}) / (${eP} + ${eN})`)
        this.buildActivationStatement(asm`${derivativeJ} = 1.0 - (+pow(${activationJ}, 2.0))`)
        statement(assign(eP, exp(stateJ)))
        statement(assign(eN, div(number(1), eP)))
        statement(assign(activationJ, div(sub(eP, eN), sum(eP, eN))))
        statement(assign(derivativeJ, sub(number(1), pow(activationJ, number(2)))))
        break
      case ActivationTypes.RELU:
        this.buildActivationStatement(asm`${activationJ} = ${stateJ} > 0.0 ? ${stateJ} : 0.0`)
        statement(assign(activationJ, conditional(gt(stateJ, number(0)), stateJ, number(0))))
        break
      case ActivationTypes.IDENTITY:
        this.buildActivationStatement(asm`${activationJ} = ${stateJ}`)
        statement(assign(activationJ, stateJ))
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
        this.buildActivationStatement(asm`${elegibilityTraceJI} = ${gainJJ} * ${weightJJ} * ${elegibilityTraceJI} + ${gainJI} * ${activationI}`)
        statement(assign(elegibilityTraceJI, sum(mul(mul(gainJJ, weightJJ), elegibilityTraceJI), mul(gainJI, activationI))))
      } else if (isSelfConnected) {
        const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
        this.buildActivationStatement(asm`${elegibilityTraceJI} = ${weightJJ} * ${elegibilityTraceJI} + ${gainJI} * ${activationI}`)
        statement(assign(elegibilityTraceJI, sum(mul(weightJJ, elegibilityTraceJI), mul(gainJI, activationI))))
      } else {
        this.buildActivationStatement(asm`${elegibilityTraceJI} = ${gainJI} * ${activationI}`)
        statement(assign(elegibilityTraceJI, mul(gainJI, activationI)))
      }

      for (g = 0; g < this.engine.gatedBy[j].length; g++) {
        k = this.engine.gatedBy[j][g]

        const isSelfConnectedK = this.engine.connections.some(connection => connection.to === k && connection.from === k)
        const isSelfConnectionGatedK = this.engine.gates.some(gate => gate.to === k && gate.from === k)

        const bigParenthesisTermResult = this.alloc('bigParenthesisTermResult', null)

        let keepBigParenthesisTerm = false
        let initializeBigParenthesisTerm = false
        if (isSelfConnectedK && this.engine.derivativeTerm[k][j]) {
          const stateK = this.alloc(`state[${k}]`, this.engine.state[k])
          this.buildActivationStatement(asm`${bigParenthesisTermResult} = ${stateK}`)
          statement(assign(bigParenthesisTermResult, stateK))
          keepBigParenthesisTerm = true
        } else {
          initializeBigParenthesisTerm = true
        }


        for (l = 0; l < this.engine.inputsOfGatedBy[k][j].length; l++) {
          a = this.engine.inputsOfGatedBy[k][j][l]
          if (a !== k) {
            if (initializeBigParenthesisTerm) {
              this.buildActivationStatement(asm`${bigParenthesisTermResult} = 0.0`)
              statement(assign(bigParenthesisTermResult, number(0)))
              initializeBigParenthesisTerm = false
            }
            const weightKA = this.alloc(`weight[${k}][${a}]`, this.engine.weight[k][a])
            const activationA = this.alloc(`activation[${a}]`, this.engine.activation[a])
            this.buildActivationStatement(asm`${bigParenthesisTermResult} = ${bigParenthesisTermResult} + ${weightKA} * ${activationA}`)
            statement(assignSum(bigParenthesisTermResult, mul(weightKA, activationA)))
            keepBigParenthesisTerm = true
          }
        }

        const extendedElegibilityTraceJIK = this.alloc(`extendedElegibilityTrace[${j}][${i}][${k}]`, this.engine.extendedElegibilityTrace[j][i][k])

        if (isSelfConnectedK && isSelfConnectionGatedK) {
          const gainKK = this.alloc(`gain[${k}][${k}]`, this.engine.gain[k][k])
          const weightKK = this.alloc(`weight[${k}][${k}]`, this.engine.weight[k][k])
          if (keepBigParenthesisTerm) {
            this.buildActivationStatement(asm`${extendedElegibilityTraceJIK} = ${gainKK} * ${weightKK} * ${extendedElegibilityTraceJIK} + ${derivativeJ} * ${elegibilityTraceJI} * ${bigParenthesisTermResult}`)
            statement(assign(extendedElegibilityTraceJIK, sum(mul(mul(gainKK, weightKK), extendedElegibilityTraceJIK), mul(mul(derivativeJ, elegibilityTraceJI), bigParenthesisTermResult))))
          } else {
            this.buildActivationStatement(asm`${extendedElegibilityTraceJIK} = ${gainKK} * ${weightKK} * ${extendedElegibilityTraceJIK}`)
            statement(assign(extendedElegibilityTraceJIK, mul(mul(gainKK, weightKK), extendedElegibilityTraceJIK)))
          }
        } else if (isSelfConnectedK) {
          const weightKK = this.alloc(`weight[${k}][${k}]`, this.engine.weight[k][k])
          if (keepBigParenthesisTerm) {
            this.buildActivationStatement(asm`${extendedElegibilityTraceJIK} = ${weightKK} * ${extendedElegibilityTraceJIK} + ${derivativeJ} * ${elegibilityTraceJI} * ${bigParenthesisTermResult}`)
            statement(assign(extendedElegibilityTraceJIK, sum(mul(weightKK, extendedElegibilityTraceJIK), mul(mul(derivativeJ, elegibilityTraceJI), bigParenthesisTermResult))))
          } else {
            this.buildActivationStatement(asm`${extendedElegibilityTraceJIK} = ${weightKK} * ${extendedElegibilityTraceJIK}`)
            statement(assign(extendedElegibilityTraceJIK, mul(weightKK, extendedElegibilityTraceJIK)))
          }
        } else {
          if (keepBigParenthesisTerm) {
            this.buildActivationStatement(asm`${extendedElegibilityTraceJIK} = ${derivativeJ} * ${elegibilityTraceJI} * ${bigParenthesisTermResult}`)
            statement(assign(extendedElegibilityTraceJIK, mul(mul(derivativeJ, elegibilityTraceJI), bigParenthesisTermResult)))
          }
        }
      }
    }

    for (h = 0; h < this.engine.gatedBy[j].length; h++) {
      to = this.engine.gatedBy[j][h]
      for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
        from = this.engine.inputsOfGatedBy[to][j][g]
        const gainToFrom = this.alloc(`gain[${to}][${from}]`, this.engine.gain[to][from])
        this.buildActivationStatement(asm`${gainToFrom} = ${activationJ}`)
        statement(assign(gainToFrom, activationJ))
      }
    }

    return activationJ
  }

  buildPropagateUnit(j: number, layerJ: number, targetJ?: Variable) {

    let hasPropagationFunction = this.document.children.some(node => node instanceof FunctionNode && node.name === 'propagate')
    if (!hasPropagationFunction) {
      this.document.addNode(func('propagate'))
    }
    let activationFunction: FunctionNode = this.document.children.reduce<FunctionNode>((found, node) => node instanceof FunctionNode && node.name === 'propagate' ? node : null, null)
    let hasLayer = activationFunction.children.some(node => node instanceof LayerNode && node.id === layerJ)
    if (!hasLayer) {
      activationFunction.addNode(layer(layerJ))
    }
    let layerNode: LayerNode = activationFunction.children.reduce<LayerNode>((found, node) => node instanceof LayerNode && node.id === layerJ ? node : null, null)
    let hasUnit = layerNode.children.some(node => node instanceof UnitNode && node.id === j)
    if (!hasUnit) {
      layerNode.addNode(unit(j))
    }
    const unitNode: UnitNode = layerNode.children.reduce<UnitNode>((found, node) => node instanceof UnitNode && node.id === j ? node : null, null)
    const statement = unitNode.addNode.bind(unitNode)

    let i, k, h, g, l, a
    let hasProjectedError = this.engine.projectionSet[j].length > 0
    const hasGatedError = this.engine.gateSet[j].length > 0
    if (typeof targetJ !== 'undefined') {
      hasProjectedError = true
      const errorResponsibilityJ = this.alloc(`errorResponsibility[${j}]`, this.engine.errorResponsibility[j])
      const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
      const activationJ = this.alloc(`activation[${j}]`, this.engine.activation[j])
      this.buildPropagationStatement(asm`${errorResponsibilityJ} = ${targetJ} - ${activationJ}`)
      this.buildPropagationStatement(asm`${projectedErrorResponsibilityJ} = ${errorResponsibilityJ}`)
      statement(assign(errorResponsibilityJ, sub(targetJ, activationJ)))
      statement(assign(projectedErrorResponsibilityJ, errorResponsibilityJ))
    } else {
      const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
      if (hasProjectedError) {
        this.buildPropagationStatement(asm`${projectedErrorResponsibilityJ} = 0.0`)
        statement(assign(projectedErrorResponsibilityJ, number(0)))
      }
      for (h = 0; h < this.engine.projectionSet[j].length; h++) {
        k = this.engine.projectionSet[j][h]
        const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
        const isGated = this.engine.gates.some(gate => gate.to === k && gate.from === j)
        if (isGated) {
          const gainKJ = this.alloc(`gain[${k}][${j}]`, this.engine.gain[k][j])
          const weightKJ = this.alloc(`weight[${k}][${j}]`, this.engine.weight[k][j])
          this.buildPropagationStatement(asm`${projectedErrorResponsibilityJ} = ${projectedErrorResponsibilityJ} + ${errorResponsibilityK} * ${gainKJ} * ${weightKJ}`)
          statement(assignSum(projectedErrorResponsibilityJ, mul(mul(gainKJ, weightKJ), errorResponsibilityK)))
        } else {
          const weightKJ = this.alloc(`weight[${k}][${j}]`, this.engine.weight[k][j])
          this.buildPropagationStatement(asm`${projectedErrorResponsibilityJ} = ${projectedErrorResponsibilityJ} + ${errorResponsibilityK} * ${weightKJ}`)
          statement(assignSum(projectedErrorResponsibilityJ, mul(weightKJ, errorResponsibilityK)))
        }
      }
      const derivativeJ = this.alloc(`derivative[${j}]`, this.engine.derivative[j])
      if (hasProjectedError) {
        this.buildPropagationStatement(asm`${projectedErrorResponsibilityJ} = ${projectedErrorResponsibilityJ} * ${derivativeJ}`)
        statement(assignMul(projectedErrorResponsibilityJ, derivativeJ))
      }
      const gatedErrorResponsibilityJ = this.alloc(`gatedErrorResponsibility[${j}]`, this.engine.gatedErrorResponsibility[j])
      if (hasGatedError) {
        this.buildPropagationStatement(asm`${gatedErrorResponsibilityJ} = 0.0`)
        statement(assignMul(gatedErrorResponsibilityJ, number(0)))
      }
      for (h = 0; h < this.engine.gateSet[j].length; h++) {
        k = this.engine.gateSet[j][h]
        const isSelfConnectedK = this.engine.connections.some(connection => connection.to === k && connection.from === k)
        const bigParenthesisTermResult = this.alloc('bigParenthesisTermResult', null)

        let keepBigParenthesisTerm = false
        let initializeBigParenthesisTerm = false

        if (isSelfConnectedK && this.engine.derivativeTerm[k][j]) {
          const stateK = this.alloc(`state[${k}]`, this.engine.state[k])
          this.buildPropagationStatement(asm`${bigParenthesisTermResult} = ${stateK}`)
          statement(assign(bigParenthesisTermResult, stateK))
          keepBigParenthesisTerm = true
        } else {
          initializeBigParenthesisTerm = true
        }
        for (l = 0; l < this.engine.inputsOfGatedBy[k][j].length; l++) {
          a = this.engine.inputsOfGatedBy[k][j][l]
          if (a !== k) {
            if (initializeBigParenthesisTerm) {
              this.buildPropagationStatement(asm`${bigParenthesisTermResult} = 0.0`)
              statement(assign(bigParenthesisTermResult, number(0)))
              initializeBigParenthesisTerm = false
            }
            const weightKA = this.alloc(`weight[${k}][${a}]`, this.engine.weight[k][a])
            const activationA = this.alloc(`activation[${a}]`, this.engine.activation[a])
            this.buildPropagationStatement(asm`${bigParenthesisTermResult} = ${bigParenthesisTermResult} + ${weightKA} * ${activationA}`)
            statement(assignSum(bigParenthesisTermResult, mul(weightKA, activationA)))
            keepBigParenthesisTerm = true
          }
        }
        if (keepBigParenthesisTerm) {
          const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
          this.buildPropagationStatement(asm`${gatedErrorResponsibilityJ} = ${gatedErrorResponsibilityJ} + ${errorResponsibilityK} * ${bigParenthesisTermResult}`)
          statement(assignSum(gatedErrorResponsibilityJ, mul(errorResponsibilityK, bigParenthesisTermResult)))
        }
      }
      if (hasGatedError) {
        this.buildPropagationStatement(asm`${gatedErrorResponsibilityJ} = ${gatedErrorResponsibilityJ} * ${derivativeJ}`)
        statement(assignMul(gatedErrorResponsibilityJ, derivativeJ))
      }
      const errorResponsibilityJ = this.alloc(`errorResponsibility[${j}]`, this.engine.errorResponsibility[j])
      if (hasProjectedError && hasGatedError) {
        this.buildPropagationStatement(asm`${errorResponsibilityJ} = ${projectedErrorResponsibilityJ} + ${gatedErrorResponsibilityJ}`)
        statement(assign(errorResponsibilityJ, sum(projectedErrorResponsibilityJ, gatedErrorResponsibilityJ)))
      } else if (hasProjectedError) {
        this.buildPropagationStatement(asm`${errorResponsibilityJ} = ${projectedErrorResponsibilityJ}`)
        statement(assign(errorResponsibilityJ, projectedErrorResponsibilityJ))
      } else if (hasGatedError) {
        this.buildPropagationStatement(asm`${errorResponsibilityJ} = ${gatedErrorResponsibilityJ}`)
        statement(assign(errorResponsibilityJ, gatedErrorResponsibilityJ))
      }
    }
    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      if (hasProjectedError && hasGatedError) {
        i = this.engine.inputSet[j][h]
        const Δw = this.alloc(`Δw`, null)
        const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
        const elegibilityTraceJI = this.alloc(`elegibilityTrace[${j}][${i}]`, this.engine.elegibilityTrace[j][i])
        this.buildPropagationStatement(asm`${Δw} = ${projectedErrorResponsibilityJ} * ${elegibilityTraceJI}`)
        statement(assign(Δw, mul(projectedErrorResponsibilityJ, elegibilityTraceJI)))
        for (g = 0; g < this.engine.gateSet[j].length; g++) {
          k = this.engine.gateSet[j][g]
          const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
          const extendedElegibilityTraceJIK = this.alloc(`extendedElegibilityTrace[${j}][${i}][${k}]`, this.engine.extendedElegibilityTrace[j][i][k])
          this.buildPropagationStatement(asm`${Δw} = ${Δw} + ${errorResponsibilityK} * ${extendedElegibilityTraceJIK}`)
          statement(assignSum(Δw, mul(errorResponsibilityK, extendedElegibilityTraceJIK)))
        }
        const learningRate = this.alloc('learningRate', this.engine.learningRate)
        this.buildPropagationStatement(asm`${Δw} = ${Δw} * ${learningRate}`)
        statement(assignMul(Δw, learningRate))
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        this.buildPropagationStatement(asm`${weightJI} = ${weightJI} + ${Δw}`)
        statement(assignSum(weightJI, Δw))
      } else if (hasProjectedError) {
        i = this.engine.inputSet[j][h]
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const projectedErrorResponsibilityJ = this.alloc(`projectedErrorResponsibility[${j}]`, this.engine.projectedErrorResponsibility[j])
        const elegibilityTraceJI = this.alloc(`elegibilityTrace[${j}][${i}]`, this.engine.elegibilityTrace[j][i])
        const learningRate = this.alloc('learningRate', this.engine.learningRate)
        this.buildPropagationStatement(asm`${weightJI} = ${weightJI} + ${projectedErrorResponsibilityJ} * ${elegibilityTraceJI} * ${learningRate}`)
        statement(assignSum(weightJI, mul(mul(projectedErrorResponsibilityJ, elegibilityTraceJI), learningRate)))
      } else if (hasGatedError) {
        i = this.engine.inputSet[j][h]
        const Δw = this.alloc(`Δw`, null)
        this.buildPropagationStatement(asm`${Δw} = 0.0`)
        statement(assign(Δw, number(0)))
        for (g = 0; g < this.engine.gateSet[j].length; g++) {
          k = this.engine.gateSet[j][g]
          const errorResponsibilityK = this.alloc(`errorResponsibility[${k}]`, this.engine.errorResponsibility[k])
          const extendedElegibilityTraceJIK = this.alloc(`extendedElegibilityTrace[${j}][${i}][${k}]`, this.engine.extendedElegibilityTrace[j][i][k])
          this.buildPropagationStatement(asm`${Δw} = ${Δw} + ${errorResponsibilityK} * ${extendedElegibilityTraceJIK}`)
          statement(assignSum(Δw, mul(errorResponsibilityK, extendedElegibilityTraceJIK)))
        }
        const learningRate = this.alloc('learningRate', this.engine.learningRate)
        this.buildPropagationStatement(asm`${Δw} = ${Δw} * ${learningRate}`)
        statement(assignMul(Δw, learningRate))
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        this.buildPropagationStatement(asm`${weightJI} = ${weightJI} + ${Δw}`)
        statement(assignSum(weightJI, Δw))
      }
    }
  }

  costFunction(target: number[], predicted: number[], costType: CostTypes = CostTypes.MEAN_SQUARE_ERROR) {
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
    return statements.map(statement => statement.map(x => x instanceof Variable ? `H[${x.id}]` : x).join('')).join(';\n')
  }

  buildAsm(): AsmModule {
    this.id = 0
    this.inputs = []
    this.outputs = []
    this.targets = []
    this.variables = {}
    this.activationStatements = []
    this.propagationStatements = []
    let outputLayer = this.engine.layers.length - 1

    this.learningRate = this.alloc(`learningRate`, this.engine.learningRate)
    this.seed = this.alloc(`seed`, Math.random())
    if (this.engine.biasUnit !== null) {
      this.alloc(`activation[${this.engine.biasUnit}]`, this.engine.activation[this.engine.biasUnit])
    }

    for (let layer = 0; layer < this.engine.layers.length; layer++) {
      for (let unit = 0; unit < this.engine.layers[layer].length; unit++) {
        let activationJ: Variable
        switch (layer) {
          case 0:
            activationJ = this.alloc(`activation[${this.engine.layers[layer][unit]}]`, this.engine.activation[this.engine.layers[layer][unit]])
            this.inputs.push(activationJ)
            break
          case outputLayer:
            activationJ = this.buildActivateUnit(this.engine.layers[layer][unit], layer)
            this.outputs.push(activationJ)
            break
          default:
            this.buildActivateUnit(this.engine.layers[layer][unit], layer)
        }
      }
    }
    for (let unit = this.engine.layers[outputLayer].length - 1; unit >= 0; unit--) {
      let targetJ = this.alloc(`target[${unit}]`, null)
      this.targets.push(targetJ)
      this.buildPropagateUnit(this.engine.layers[outputLayer][unit], outputLayer, targetJ)
    }
    for (let layer = this.engine.layers.length - 2; layer > 0; layer--) {
      for (let unit = this.engine.layers[layer].length - 1; unit >= 0; unit--) {
        this.buildPropagateUnit(this.engine.layers[layer][unit], layer)
      }
    }
    this.targets = this.targets.reverse()

    this.heap = new ArrayBuffer(Math.max(this.id * 8, 0x10000))
    this.view = new Float64Array(this.heap)
    Object.keys(this.variables).forEach(key => {
      const variable = this.variables[key]
      if (typeof variable.initialValue === 'number') {
        this.view[variable.id] = variable.initialValue
      }
    })

    console.log(this.document.toString())

    const source = `"use asm";
var H = new stdlib.Float64Array(heap);
var exp = stdlib.Math.exp;
var pow = stdlib.Math.pow;
var random = foreign.random;

${this.document}

return {
  ${this.document.children.filter(x => x instanceof FunctionNode).map((x: FunctionNode) => x.name + ': ' + x.name).join(',\n  ')}
}`
    const ctor = new Function('stdlib', 'foreign', 'heap', source)

    // console.log(ctor, ctor.toString())
    const foreign = { random: this.engine.random }
    const module = ctor({ Math, Float64Array }, foreign, this.heap)

    // fix targets order

    return {
      module,
      activate: (inputs: number[]) => {
        for (let i = 0; i < this.inputs.length; i++) {
          this.view[this.inputs[i].id] = inputs[i]
        }
        module.activate()
        let activation = new Array(this.outputs.length)
        for (let i = 0; i < this.outputs.length; i++) {
          activation[i] = this.view[this.outputs[i].id]
        }
        return activation
      },
      propagate: (targets: number[]) => {
        for (let i = 0; i < this.targets.length; i++) {
          this.view[this.targets[i].id] = targets[i]
        }
        this.view[this.learningRate.id] = this.engine.learningRate
        module.propagate()
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