declare var console;

import { Backend, TrainResult } from "../../src/backends/index";
import { PerformanceTest } from "./interfaces";
import { cost } from "../../src/utils/cost";

export async function run(test: string, options: {
  backend: typeof Backend
}): Promise<TrainResult> {
  const module = await import('./specs/' + test);
  const runner: PerformanceTest = module.default;

  console.time('Build network');
  let network = await runner.build(options.backend);
  console.timeEnd('Build network');



  console.time('Train');
  let trainResult = await runner.run(network);
  console.timeEnd('Train');
  console.log('Train result: ', trainResult);

  let testSet = await runner.getTestingSet();

  await runner.validate(network, trainResult);

  if (testSet && testSet.length) {
    let error = 0;
    console.time('Activativate');
    for (let index = 0; index < testSet.length; index++) {
      const x = testSet[index];
      let predictedOutput = await network.activate(x.input);
      let partialError = cost(x.output, predictedOutput, runner.costFunction);
      error += partialError;
    }
    console.timeEnd('Activativate');
    console.log('Test set error: ' + (error / testSet.length));
  }

  console.log('Iterations: ' + trainResult.iterations);


  return trainResult;
}