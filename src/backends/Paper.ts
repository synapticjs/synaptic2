// // This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// // trying to keep the code as close as posible to the equations and as verbose as possible.

// import Lysergic, { ActivationTypes, StatusTypes } from 'lysergic';
// import { Backend, activationFunction, activationFunctionDerivative } from './Backend';

// export default class Paper extends Backend {
//   constructor(public compiler = new Lysergic()) {
//     super(engine);
//     this.activateUnit = this.activateUnit.bind(this);
//     this.propagateUnit = this.propagateUnit.bind(this);
//     this.activate = this.activate.bind(this);
//     this.propagate = this.propagate.bind(this);
//     this.bigParenthesisTerm = this.bigParenthesisTerm.bind(this);
//     this.activationFunction = this.activationFunction.bind(this);
//     this.activationFunctionDerivative = this.activationFunctionDerivative.bind(this);

//     this.train = this.train.bind(this);
//   }

//   activateUnit(unit: number, input: number): number {
//     // glosary
//     const j = unit;
//     const s = this.compiler.state;
//     const w = this.compiler.weight;
//     const g = this.compiler.gain;
//     const y = this.compiler.activation;
//     const f = this.activationFunction;
//     const df = this.activationFunctionDerivative;
//     const ε = this.compiler.elegibilityTrace;
//     const xε = this.compiler.extendedElegibilityTrace;

//     // unit sets
//     const inputSet = this.compiler.inputSet;
//     const gatedBy = this.compiler.gatedBy;
//     const inputsOfGatedBy = this.compiler.inputsOfGatedBy;

//     // this is only for input neurons (they receive their activation from the environment)
//     if (typeof input !== 'undefined') {

//       y[j] = input;

//     } else {

//       // eq. 15
//       s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputSet[j], i => g[j][i] * w[j][i] * y[i]); // compute state of j

//       // eq. 16
//       y[j] = f(j); // compute activation of j

//       for (let i of inputSet[j]) { // comupute elegibility traces for j's inputs

//         // eq. 17
//         ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i];

//         for (let k of gatedBy[j]) { // compute extended elegibility traces for j's inputs

//           // eq. 18
//           xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df(j) * ε[j][i] * this.bigParenthesisTerm(k, j);
//         }
//       }

//       // update the gain of the connections gated by this unit with its activation value

//       for (let to of gatedBy[unit]) {
//         for (let from of inputsOfGatedBy[to][unit]) {
//           // eq. 14
//           g[to][from] = y[unit];
//         }
//       }
//     }

//     // return the activation of this unit
//     return y[j];
//   }

//   propagateUnit(unit: number, target?: number) {
//     // glosary
//     const j = unit;
//     // const s = this.engine.state
//     const w = this.compiler.weight;
//     const g = this.compiler.gain;
//     const y = this.compiler.activation;
//     const df = this.activationFunctionDerivative;
//     const δ = this.compiler.errorResponsibility;
//     const δP = this.compiler.projectedErrorResponsibility;
//     const δG = this.compiler.gatedErrorResponsibility;
//     const α = this.compiler.learningRate;
//     const ε = this.compiler.elegibilityTrace;
//     const xε = this.compiler.extendedElegibilityTrace;
//     const P = this.compiler.projectionSet;
//     const G = this.compiler.gateSet;

//     // unit sets
//     const inputSet = this.compiler.inputSet;

//     // step 1: compute error responsibiltity (δ) for j

//     if (typeof target !== 'undefined') { // this is only for output neurons, the error is injected from the environment

//       // eq. 10
//       δ[j] = δP[j] = target - y[j];

//     } else { // for the rest of the units the error is computed by backpropagation

//       // eq. 21
//       δP[j] = df(j) * Σ(P[j], k => δ[k] * g[k][j] * w[k][j]);

//       // eq. 22
//       δG[j] = df(j) * Σ(G[j], k => δ[k] * this.bigParenthesisTerm(k, j));

//       // eq. 23
//       δ[j] = δP[j] + δG[j];

//     }

//     // step 2: compute deltas (Δw) and adjust the weights for all the inputs of j

//     for (let i of inputSet[j]) {

//       // eq. 24
//       const Δw = α * δP[j] * ε[j][i] + α * Σ(G[j], k => δ[k] * xε[j][i][k]);

//       // adjust the weights using delta
//       w[j][i] += Δw;
//     }
//   }

//   /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
//   bigParenthesisTerm(k: number, j: number) {
//     // glosary
//     const w = this.compiler.weight;
//     const s = this.compiler.state;
//     const y = this.compiler.activation;
//     const dt = this.compiler.derivativeTerm[k][j]; // the derivative term is 1 if and only if j gates k's self-connection, otherwise is 0
//     const units = this.compiler.inputsOfGatedBy[k][j]; // this index runs over all the inputs of k, that are gated by j

//     // big parenthesis term
//     return dt * w[k][k] * s[k] + Σ(units.filter(a => a !== k), a => w[k][a] * y[a]);
//   }


//   private activationFunction(unit: number): number {
//     const x: number = this.compiler.state[unit];
//     const type = this.compiler.activationFunction[unit];

//     switch (type) {
//       case ActivationTypes.MAX_POOLING:
//         const inputUnit = this.compiler.inputsOf[unit][0];
//         const gatedUnit = this.compiler.gatedBy[unit][0];
//         const inputsOfGatedUnit = this.compiler.inputsOfGatedBy[gatedUnit][unit];

//         const allActivations = inputsOfGatedUnit.map($ => this.compiler.activation[$]);
//         const maxActivation = Math.max(...allActivations);

//         const inputUnitWithHigherActivation = inputsOfGatedUnit.reduce((found, unit) => this.compiler.activation[unit] === maxActivation ? unit : found, null);
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
//     const x: number = this.compiler.state[unit];
//     const fx: number = this.compiler.activation[unit];

//     const type = this.compiler.activationFunction[unit];

//     switch (type) {
//       case ActivationTypes.MAX_POOLING:
//         return 0;
//       // case ActivationTypes.DROPOUT:
//       //   return 0;
//       default:
//         return activationFunctionDerivative(x, fx, type);
//     }
//   }

//   async activate(inputs: number[]): Promise<ArrayLike<number>> {
//     this.compiler.status = StatusTypes.ACTIVATING;
//     const activations = this.compiler.layers.map((layer, layerIndex) => {
//       return layer.map((unit, unitIndex) => {
//         const input = layerIndex === 0 ? inputs[unitIndex] : void 0; // only units in the input layer receive an input
//         return this.activateUnit(unit, input);
//       });
//     });
//     this.compiler.status = StatusTypes.IDLE;
//     return activations.pop(); // return activation of the last layer (aka output layer)
//   }

//   async propagate(targets: number[]) {
//     this.compiler.status = StatusTypes.PROPAGATING;
//     this.compiler.layers
//       .slice(1) // input layer doesn't propagate
//       .reverse() // layers propagate in reverse order
//       .forEach((layer, layerIndex) => {
//         layer
//           .slice()
//           .reverse() // units get propagated in reverse order
//           .forEach((unit, unitIndex) => {
//             const target = layerIndex === 0 ? targets[unitIndex] : void 0; // only units in the output layer receive a target
//             this.propagateUnit(unit, target);
//           });
//       });
//     this.compiler.status = StatusTypes.IDLE;
//   }
// }

// // --

// // helper for doing summations
// function Σ(indexes: number[], fn: (num: number) => number) {
//   return indexes.reduce((sum, value) => sum + fn(value), 0);
// }
