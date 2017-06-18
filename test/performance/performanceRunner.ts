declare var console;

import { Backend, TrainResult } from "../../src/backends/index";
import { PerformanceTest, printError } from "./interfaces";
import { cost } from "../../src/utils/cost";

function numToStr(num: number) {
  let ret = num.toFixed(3);
  if (ret == '0.000') return '     ';
  return ret;
}

export async function run(test: string, options: {
  backend: typeof Backend
}): Promise<TrainResult> {
  const module = await import('./specs/' + test);
  const runner: PerformanceTest = module.default;

  console.time('Build network');
  let network = await runner.build(options.backend);
  console.timeEnd('Build network');

  console.log('Network information:');
  console.log('  Units: ' + network.compiler.topology.units);
  console.log('  Connections: ' + network.compiler.topology.connections.length);
  console.log('  Gates: ' + network.compiler.topology.gates.length);


  console.time('Train');
  let trainResult = await runner.run(network);
  console.timeEnd('Train');
  console.log('  Iterations: ' + trainResult.iterations);
  console.log('  Error: ' + trainResult.error);


  console.time('Validate');
  await runner.validate(network, trainResult);
  console.timeEnd('Validate');

  let testSet = await runner.getTestingSet();
  if (testSet && testSet.length) {
    let error = 0;
    console.log('Test set: ' + testSet.length + ' items');
    console.time('  Execute test set');
    let partialErrors = [];
    for (let index = 0; index < testSet.length; index++) {
      const x = testSet[index];
      let predictedOutput = await network.activate(x.input);
      let partialError = cost(x.output, predictedOutput, runner.costFunction);
      partialErrors.push(partialError);
      console.log(printError(partialError, null));
      console.log('  Expected: ' + x.output.map(numToStr).join(' '));
      console.log('     Given: ' + Array.prototype.slice.apply(predictedOutput).map(numToStr).join(' '));
      console.log('');
      error += partialError;
    }
    console.timeEnd('  Execute test set');
    console.log('  Test set error: ' + (error / testSet.length));
    console.log(printError(error / testSet.length, partialErrors));
  }




  return trainResult;
}