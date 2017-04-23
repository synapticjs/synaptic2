/*

To run this use: 

node --trace_opt --trace_deopt --allow-natives-syntax optimization.js

*/

var synaptic = require('./dist/synaptic')

var lstm = new synaptic.Network(
  new synaptic.layers.Input(6),
  new synaptic.layers.LSTM(7),
  new synaptic.layers.Dense(2)
)

lstm.backend = new synaptic.backends.CPU(lstm.engine)

function printStatus(fn) {
    switch(%GetOptimizationStatus(fn)) {
        case 1: console.log("Function is optimized"); break;
        case 2: console.log("Function is not optimized"); break;
        case 3: console.log("Function is always optimized"); break;
        case 4: console.log("Function is never optimized"); break;
        case 6: console.log("Function is maybe deoptimized"); break;
        case 7: console.log("Function is optimized by TurboFan"); break;
        default: console.log("Unknown optimization status"); break;
    }
}

//Fill type-info
lstm.backend.activate([0,0,0,0,0,0]);
// 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic
lstm.backend.activate([0,0,0,0,0,0]);

%OptimizeFunctionOnNextCall(lstm.backend.activate);
//The next call
lstm.backend.activate([0,0,0,0,0,0]);

//Check
printStatus(lstm.backend.activate);