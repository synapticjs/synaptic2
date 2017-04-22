// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

import Engine, { ActivationTypes, StatusTypes } from '../Engine'
import { CostTypes } from '../Trainer'

let index = 0
class Variable {
  public id: string
  public value: number
  public index: number

  constructor (id: string, value: number) {
    this.id = id
    this.value = value
    this.index = index++
  }
}

export default class ASM {
  
  public activateFn: Function = null
  public heap: Float32Array = null
  public variables: any = {}
  public statements: any[] = []

  constructor(public engine = new Engine()) {
  }

  alloc (id: string, value: number): any {
    if (!(id in this.variables)) {
      this.variables[id] = new Variable(id, value)
    }
    return this.variables[id]
  }

  buildStatement (...parts) {
    this.statements.push(parts)
  }

  buildActivateUnit(j: number, inputIndex?: number): void {
    const activationJ = this.alloc(`activation[${j}]`, this.engine.activation[j])
    let i, k, h, g, to, from
    const stateJ = this.alloc(`state[${j}]`, this.engine.state[j])
    
    const isSelfConnected = this.engine.connections.some(connection => connection.to === j && connection.from === j)
    const isSelfConnectionGated = this.engine.gates.some(gate => gate.to === j && gate.from === j)
    
    if (isSelfConnected && isSelfConnectionGated) {
      const gainJJ = this.alloc(`gain[${j}][${j}]`, this.engine.gain[j][j])
      const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
      this.buildStatement(stateJ, '*=', gainJJ, '*', weightJJ)
    } else if (isSelfConnected) {
      const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
      this.buildStatement(stateJ, '*=', weightJJ)
    }

    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      const isGated = this.engine.gates.some(gate => gate.from === i && gate.to === j)
      if (isGated) {
        const gainJI = this.alloc(`gain[${j}][${i}]`, this.engine.gain[j][i])
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
        this.buildStatement(stateJ, '+=', gainJI, '*', weightJI, '*', activationI)
      } else {
        const weightJI = this.alloc(`weight[${j}][${i}]`, this.engine.weight[j][i])
        const activationI = this.alloc(`activation[${i}]`, this.engine.activation[i])
        this.buildStatement(stateJ, '+=', weightJI, '*', activationI)
      }
    }

    const type = this.engine.activationFunction[j]
    switch (type) {
      case ActivationTypes.LOGISTIC_SIGMOID:
        this.buildStatement(activationJ, '=', '1.0', '/', '1.0', '+', 'Math.exp(-', stateJ, ')')
        break
      case ActivationTypes.TANH:
        const eP = this.alloc('eP', null)
        const eN = this.alloc('eN', null)
        this.buildStatement(eP, '=', 'Math.exp(', stateJ, ')')
        this.buildStatement(activationJ, '=', '(', eP, '-', eN, ')', '/', '(', eP, '+', eN, ')')
        break 
      case ActivationTypes.RELU:
        this.buildStatement(activationJ, '=', stateJ, '>', '0.0', '?', stateJ, ':', '0.0')
        break
      case ActivationTypes.IDENTITY:
        this.buildStatement(activationJ, '=', stateJ)
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
        this.buildStatement(elegibilityTraceJI, '=', gainJJ, '*', weightJJ, '*', elegibilityTraceJI, '+', gainJI, '*', activationI)
      } else if (isSelfConnected) {
        const weightJJ = this.alloc(`weight[${j}][${j}]`, this.engine.weight[j][j])
        this.buildStatement(elegibilityTraceJI, '=', weightJJ, '*', elegibilityTraceJI, '+', gainJI, '*', activationI)
      } else {
        this.buildStatement(elegibilityTraceJI, '=', gainJI, '*', activationI)
      }
      
      for (g = 0; g < this.engine.gatedBy[j].length; g++) {
        k = this.engine.gatedBy[j][g]

        const isSelfConnectedK = this.engine.connections.some(connection => connection.to === k && connection.from === k)
        const isSelfConnectionGatedK = this.engine.gates.some(gate => gate.to === k && gate.from === k)
        
        const derivativeJ = this.alloc(`derivative[${j}]`, this.engine.derivative[j])
        const type = this.engine.activationFunction[j]
        switch (type) {
          case ActivationTypes.LOGISTIC_SIGMOID:
            this.buildStatement(derivativeJ, '=', activationJ, '*', '(', '1.0', '-', activationJ, ')')
            break;
          case ActivationTypes.TANH:
            this.buildStatement(derivativeJ, '=', '1.0', '-', 'Math.pow', '(', activationJ, ',', '2.0', ')')
            break;
          case ActivationTypes.RELU:
          case ActivationTypes.IDENTITY:
          case ActivationTypes.MAX_POOLING:
          case ActivationTypes.DROPOUT:
            break;
        }

        const bigParenthesisTermResult = this.alloc('bigParenthesisTermResult', null)

        let keepBigParenthesisTerm = false
        let initializeBigParenthesisTerm = false
        if (isSelfConnectedK && this.engine.derivativeTerm[k][j]) {
          const stateK = this.alloc(`state[${k}]`, this.engine.state[k])
          this.buildStatement(bigParenthesisTermResult, '=', stateK)
          keepBigParenthesisTerm = true
        } else {
          initializeBigParenthesisTerm = true
        }
        
        
        for (var l = 0; l < this.engine.inputsOfGatedBy[k][j].length; l++) {
          var a = this.engine.inputsOfGatedBy[k][j][l]
          if (a !== k) {
            if (initializeBigParenthesisTerm) {
              this.buildStatement(bigParenthesisTermResult, '=', '0.0')
              initializeBigParenthesisTerm = false
            }
            const weightKA = this.alloc(`weight[${k}][${a}]`, this.engine.weight[k][a])
            const activationA = this.alloc(`activation[${a}]`, this.engine.activation[a])
            this.buildStatement(bigParenthesisTermResult, '+=', weightKA, '*', activationA)
            keepBigParenthesisTerm = true
          }
        }

        const extendedElegibilityTraceJIK = this.alloc(`extendedElegibilityTrace[${j}][${i}][${k}]`, this.engine.extendedElegibilityTrace[j][i][k])

        if (isSelfConnected && isSelfConnectionGated) {
          const gainKK = this.alloc(`gain[${k}][${k}]`, this.engine.gain[k][k])
          const weightKK = this.alloc(`weight[${k}][${k}]`, this.engine.weight[k][k])
          if (keepBigParenthesisTerm) {
            this.buildStatement(extendedElegibilityTraceJIK, '=', gainKK, '*', weightKK, '*', extendedElegibilityTraceJIK, '+', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult)
          } else {
            this.buildStatement(extendedElegibilityTraceJIK, '=', gainKK, '*', weightKK, '*', extendedElegibilityTraceJIK)
          }
        } else if (isSelfConnected) {
          const weightKK = this.alloc(`weight[${k}][${k}]`, this.engine.weight[k][k])
          if (keepBigParenthesisTerm) {
            this.buildStatement(extendedElegibilityTraceJIK, '=', weightKK, '*', extendedElegibilityTraceJIK, '+', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult)
          } else {
            this.buildStatement(extendedElegibilityTraceJIK, '=', weightKK, '*', extendedElegibilityTraceJIK)
          }
        } else {
          if (keepBigParenthesisTerm) {
            this.buildStatement(extendedElegibilityTraceJIK, '=', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult)
          }
        }          
      }
    }

    for (h = 0; h < this.engine.gatedBy[j].length; h++) {
      to = this.engine.gatedBy[j][h]
      for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
        from = this.engine.inputsOfGatedBy[to][j][g]
        const gainToFrom = this.alloc(`gain[${to}][${from}]`, this.engine.gain[to][from])
        this.buildStatement(gainToFrom, '=', activationJ)
      }
    }
    return activationJ
  }

  propagateUnit(j: number, target?: number) {
    let i, k, h, g
    if (typeof target !== 'undefined') {

      this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] = target - this.engine.activation[j]

    } else {
      this.engine.projectedErrorResponsibility[j] = 0
      for (h = 0; h < this.engine.projectionSet[j].length; h++) {
        k = this.engine.projectionSet[j][h]
        this.engine.projectedErrorResponsibility[j] +=  this.engine.errorResponsibility[k] * this.engine.gain[k][j] * this.engine.weight[k][j]
      }
      const derivative = this.activationFunctionDerivative(j)
      this.engine.projectedErrorResponsibility[j] *= derivative

      this.engine.gatedErrorResponsibility[j] = 0
      for (h = 0; h < this.engine.gateSet[j].length; h++) {
        k = this.engine.gateSet[j][h]
        this.engine.gatedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.bigParenthesisTerm(k, j)
      }
      this.engine.gatedErrorResponsibility[j] *= derivative

      this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] + this.engine.gatedErrorResponsibility[j]

    }
    for (h = 0; h < this.engine.inputSet[j].length; h++) {
      i = this.engine.inputSet[j][h]
      let Δw = this.engine.projectedErrorResponsibility[j] * this.engine.elegibilityTrace[j][i]
      for (g = 0; g < this.engine.gateSet[j].length; g++) {
        k = this.engine.gateSet[j][g]
        Δw += this.engine.errorResponsibility[k] * this.engine.extendedElegibilityTrace[j][i][k]
      }
      Δw *= this.engine.learningRate
      this.engine.weight[j][i] += Δw
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
        const inputUnitWithHigherActivation = inputsOfGatedUnit.find(input => this.engine.activation[input] === maxActivation)
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
      case CostTypes.MSE:
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
    if (!this.activateFn) {
      this.statements = []
      let outputLayerIndex = this.engine.layers.length - 1
      for (let i = 0; i < this.engine.layers.length; i++) {
        for (let j = 0; j < this.engine.layers[i].length; j++) {
          let activationJ
          switch(i) {
            case 0:
              activationJ = this.alloc(`activation[${j}]`, this.engine.activation[j])
              this.buildStatement(activationJ, '=', `input[${j}]`)
              break;
            case outputLayerIndex:
              this.buildActivateUnit(this.engine.layers[i][j])
              break;
            default:
              activationJ = this.buildActivateUnit(this.engine.layers[i][j])
              this.buildStatement( `output[${j}]`, '=', activationJ)
          }
        }
      }
      //this.activateFn = this.buildActivate()
    }
    const activation = this.activateFn(inputs)
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
      for (let j = this.engine.layers[i].length - 1; j >= 0 ; j--) {
        this.propagateUnit(this.engine.layers[i][j])
      }
    }
    this.engine.status = StatusTypes.IDLE
  }

  train(dataset: Array<{ input: number[]; output: number[]; }>, { learningRate, minError, maxIterations, costFunction }) {
    return new Promise(resolve => {

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
      resolve({
        error,
        iterations,
        time: new Date().getTime() - startTime
      })
    })
  }
}
