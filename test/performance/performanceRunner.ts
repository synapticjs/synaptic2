declare var console, require, process;

import { Backend, TrainResult } from "../../src/backends/index";
import { PerformanceTest, printError } from "./interfaces";
import { cost } from "../../src/utils/cost";
import { logDimensionMean } from "../../src/backends/Backend";
const path = require('path'), fs = require('fs');

function numToStr(num: number) {
  let ret = num.toFixed(3);
  if (ret == '0.000') return '     ';
  return ret;
}

let startRunDate = new Date().toISOString().replace(/:/g, '_');

export interface IStoredTestResult {
  test: string;
  network: any;
  trainedNetwork: any;
  trainResult: TrainResult;
  testSet: any;
  trainingSet: any;
}

let testResults: IStoredTestResult[] = [];

export async function run(test: string, options: {
  backend: typeof Backend
}): Promise<TrainResult> {
  console.log('Loading ' + test);
  console.time('Loading ' + test);
  const module = await import('./specs/' + test);
  console.timeEnd('Loading ' + test);
  const runner: PerformanceTest = module.default;

  console.log('Running ' + test);
  console.time('  Build network');
  let network = await runner.build(options.backend);
  console.timeEnd('  Build network');


  let testResult: IStoredTestResult = {
    test,
    trainResult: null,
    network: network.toJSON(),
    testSet: null,
    trainedNetwork: null,
    trainingSet: null
  };

  testResults.push(testResult);

  console.log('  Network information:');
  console.log('    Units: ' + network.compiler.topology.units);
  console.log('    Connections: ' + network.compiler.topology.connections.length);
  console.log('    Gates: ' + network.compiler.topology.gates.length);

  console.log('Initial weights');
  logDimensionMean('weight', network.compiler);

  console.time('  Train');

  console.log('travis_fold:start:Train');
  console.log('  Train');
  let trainResult = await runner.run(network);
  console.log('travis_fold:end:Train');
  console.timeEnd('  Train');
  console.log('    Iterations: ' + trainResult.iterations);
  console.log('    Error: ' + trainResult.error);

  testResult.trainResult = trainResult;
  testResult.trainingSet = await runner.getTrainigSet();

  testResult.trainedNetwork = network.toJSON();

  let testSet = testResult.testSet = await runner.getTestingSet();
  if (testSet && testSet.length) {

    let error = 0;
    console.log('travis_fold:start:Test');
    console.log('  Test set: ' + testSet.length + ' items');
    console.time('    Execute test set');
    let partialErrors = [];
    for (let index = 0; index < testSet.length; index++) {
      const x = testSet[index];
      let predictedOutput = await network.activate(x.input);
      let partialError = cost(x.output, predictedOutput, runner.costFunction);
      partialErrors.push(partialError);
      console.log('    ' + printError(partialError, null));
      console.log('    Expected: ' + x.output.map(numToStr).join(' '));
      console.log('       Given: ' + Array.prototype.slice.apply(predictedOutput).map(numToStr).join(' '));
      console.log('');
      error += partialError;
    }
    console.log('travis_fold:end:Test');
    console.timeEnd('    Execute test set');

    console.log('    Test set error: ' + (error / testSet.length));
    console.log(printError(error / testSet.length, partialErrors));
  }

  console.log('Final weights');
  logDimensionMean('weight', network.compiler);

  console.time('  Validate');
  await runner.validate(network, trainResult);
  console.timeEnd('  Validate');

  return trainResult;
}

export function storeResults(folder) {
  testResults.forEach(($, $$) => {
    try {
      fs.mkdirSync(path.resolve(process.cwd(), folder));
    } catch (e) { }
    try {
      fs.mkdirSync(path.resolve(process.cwd(), folder, startRunDate));
    } catch (e) { }

    let filePath = path.resolve(process.cwd(), folder, startRunDate, $$ + '-' + $.test + '.json');
    let file = fs.openSync(filePath, 'w');
    console.log('Writing ' + filePath);
    try {
      fs.writeSync(file, JSON.stringify($, null, 1));
      console.log('Writing ' + filePath + ' OK');
    } catch (e) {
      console.log('Writing ' + filePath + ' ERROR ');
      console.error(e);
    } finally {
      fs.closeSync(file);
    }
  });
}