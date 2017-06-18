// import { Activations } from 'lysergic';
// import { Backend, activationFunction, activationFunctionDerivative } from './Backend';

// export class CPU extends Backend {
//   private activateUnit(j: number): number {
//     let i = 0, k = 0, h = 0, g = 0, to = 0, from = 0, topology = this.compiler.topology;
//     let state = 0;
//     let activation = 0;
//     let derivative = 0;
//     let elegibilityTrace = 0;
//     let elegibilityTraceDerivated = 0;
//     let inputSetLength = 0;
//     let localGainByWeight = engine.gain[j][j] * engine.weight[j][j];
//     state = engine.state[j];
//     state = state * localGainByWeight;

//     inputSetLength = topology.inputSet[j].length;
//     for (h = 0; h < inputSetLength; h++) {
//       i = topology.inputSet[j][h];
//       if (engine.gain[j][i] !== 0)
//         state = state + engine.gain[j][i] * engine.weight[j][i] * engine.activation[i];
//     }
//     engine.state[j] = state;

//     activation = this.activationFunction(j);
//     engine.activation[j] = activation;

//     derivative = this.activationFunctionDerivative(j);

//     engine.derivative[j] = derivative;

//     for (h = 0; h < inputSetLength; h++) {
//       i = topology.inputSet[j][h];
//       elegibilityTrace = localGainByWeight * engine.elegibilityTrace[j][i] + engine.gain[j][i] * engine.activation[i];
//       engine.elegibilityTrace[j][i] = elegibilityTrace;
//       elegibilityTraceDerivated = elegibilityTrace * derivative;
//       for (g = 0; g < topology.gatedBy[j].length; g++) {
//         k = topology.gatedBy[j][g];
//         engine.extendedElegibilityTrace[j][i][k] = engine.gain[k][k] * engine.weight[k][k] * engine.extendedElegibilityTrace[j][i][k] + elegibilityTraceDerivated * this.bigParenthesisTerm(k, j);
//       }
//     }

//     for (h = 0; h < topology.gatedBy[j].length; h++) {
//       to = topology.gatedBy[j][h];
//       for (g = 0; g < topology.inputsOfGatedBy[to][j].length; g++) {
//         from = topology.inputsOfGatedBy[to][j][g];
//         engine.gain[to][from] = activation;
//       }
//     }


//     return activation;
//   }

//   private propagateUnit(unit: number) {
//     let k = 0, h = 0, engine = this.compiler.engine, topology = this.compiler.topology;
//     let gatedErrorResponsibility = 0;
//     let projectedErrorResponsibility = 0;

//     for (h = 0; h < topology.projectionSet[unit].length; h++) {
//       k = topology.projectionSet[unit][h];
//       projectedErrorResponsibility = projectedErrorResponsibility + engine.errorResponsibility[k] * engine.gain[k][unit] * engine.weight[k][unit];
//     }
//     engine.projectedErrorResponsibility[unit] = projectedErrorResponsibility * engine.derivative[unit];

//     for (h = 0; h < topology.gateSet[unit].length; h++) {
//       k = topology.gateSet[unit][h];
//       gatedErrorResponsibility = gatedErrorResponsibility + engine.errorResponsibility[k] * this.bigParenthesisTerm(k, unit);
//     }
//     engine.gatedErrorResponsibility[unit] = gatedErrorResponsibility * engine.derivative[unit];

//     engine.errorResponsibility[unit] = engine.projectedErrorResponsibility[unit] + engine.gatedErrorResponsibility[unit];

//     this.propagateUnitWeights(unit);
//   }

//   /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
//   private bigParenthesisTerm(k: number, j: number) {
//     const engine = this.compiler.engine, topology = this.compiler.topology;
//     let result = engine.derivativeTerm[k][j] * engine.weight[k][k] * engine.state[k];
//     for (let i = 0; i < topology.inputsOfGatedBy[k][j].length; i++) {
//       let a = topology.inputsOfGatedBy[k][j][i];
//       if (a !== k) {
//         result += engine.weight[k][a] * engine.activation[a];
//       }
//     }
//     return result;
//   }

//   private activationFunction(unit: number): number {
//     const x: number = this.compiler.engine.state[unit];
//     const type = this.compiler.engine.activationFunction[unit];

//     switch (type) {
//       case Activations.ActivationTypes.MAX_POOLING:
//         const inputUnit = this.compiler.topology.inputsOf[unit][0];
//         const gatedUnit = this.compiler.topology.gatedBy[unit][0];
//         const inputsOfGatedUnit = this.compiler.topology.inputsOfGatedBy[gatedUnit][unit];

//         const allActivations = inputsOfGatedUnit.map($ => this.compiler.engine.activation[$]);
//         const maxActivation = Math.max(...allActivations);

//         const inputUnitWithHigherActivation = inputsOfGatedUnit.reduce((found, unit) => this.compiler.engine.activation[unit] === maxActivation ? unit : found, null);
//         return inputUnitWithHigherActivation === inputUnit ? 1 : 0;

//       // case ActivationTypes.DROPOUT:
//       //   const chances = x;

//       //   if (this.engine.random() < chances && this.engine.status === StatusTypes.TRAINING) {
//       //     return 0;
//       //   } else {
//       //     return 1;
//       //   }
//       default:
//         return activationFunction(x, type);
//     }
//   }

//   private activationFunctionDerivative(unit: number) {
//     const x: number = this.compiler.engine.state[unit];
//     const fx: number = this.compiler.engine.activation[unit];

//     const type = this.compiler.engine.activationFunction[unit];

//     switch (type) {
//       case Activations.ActivationTypes.MAX_POOLING:
//         return 0;

//       default:
//         return activationFunctionDerivative(x, fx, type);
//     }
//   }

//   private propagateUnitWeights(unit: number) {
//     let i = 0, Δw = 0, k = 0, g = 0, h = 0;
//     let engine = this.compiler.engine, topology = this.compiler.topology;

//     const unitExtendedElegibilityTraces = engine.extendedElegibilityTrace[unit];
//     const unitElegibilityTraces = engine.elegibilityTrace[unit];
//     const unitGateSet = topology.gateSet[unit];
//     const unitInputSet = topology.inputSet[unit];
//     const unitInputSetLength = unitInputSet.length;
//     const unitProjectedErrorResponsibility = engine.projectedErrorResponsibility[unit];

//     for (h = 0; h < unitInputSetLength; h++) {
//       i = unitInputSet[h];
//       Δw = unitProjectedErrorResponsibility * unitElegibilityTraces[i];
//       for (g = 0; g < unitGateSet.length; g++) {
//         k = unitGateSet[g];
//         Δw += engine.errorResponsibility[k] * unitExtendedElegibilityTraces[i][k];
//       }
//       Δw *= engine.learningRate;
//       engine.weight[unit][i] += Δw;
//     }
//   }

//   async activate(inputs: number[]) {
//     this.compiler.engine.status = Engine.StatusTypes.ACTIVATING;
//     let outputLayerIndex = this.compiler.topology.layers.length - 1;
//     let activation = new Array(this.compiler.topology.layers[outputLayerIndex].length);

//     for (let j = 0; j < this.compiler.topology.layers[0].length; j++) {
//       this.compiler.engine.activation[this.compiler.topology.layers[0][j]] = inputs[j];
//     }

//     for (let layer = 1; layer < this.compiler.topology.layers.length - 1; layer++) {
//       for (let j = 0; j < this.compiler.topology.layers[layer].length; j++) {
//         this.activateUnit(this.compiler.topology.layers[layer][j]);
//       }
//     }

//     for (let j = 0; j < this.compiler.topology.layers[outputLayerIndex].length; j++) {
//       activation[j] = this.activateUnit(this.compiler.topology.layers[outputLayerIndex][j]);
//     }

//     this.compiler.engine.status = Engine.StatusTypes.IDLE;
//     return activation;
//   }


//   async propagate(targets: number[]) {
//     this.compiler.engine.status = Engine.StatusTypes.PROPAGATING;
//     let outputLayerIndex = this.compiler.topology.layers.length - 1;
//     if (this.compiler.topology.layers[outputLayerIndex].length != targets.length) {
//       throw new Error(`Invalid number of projected targets, expecting ${this.compiler.topology.layers[outputLayerIndex].length} got ${targets.length}`);
//     }

//     for (let j = this.compiler.topology.layers[outputLayerIndex].length - 1; j >= 0; j--) {
//       let unit = this.compiler.topology.layers[outputLayerIndex][j];
//       this.compiler.engine.errorResponsibility[unit] = this.compiler.engine.projectedErrorResponsibility[unit] = targets[j] - this.compiler.engine.activation[unit];
//       this.propagateUnitWeights(unit);
//     }

//     for (let i = this.compiler.topology.layers.length - 2; i > 0; i--) {
//       for (let j = this.compiler.topology.layers[i].length - 1; j >= 0; j--) {
//         this.propagateUnit(this.compiler.topology.layers[i][j]);
//       }
//     }
//     this.compiler.engine.status = Engine.StatusTypes.IDLE;
//   }
// }

// export default CPU;