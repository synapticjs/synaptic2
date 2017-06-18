import MersenneTwister = require('mersenne-twister');

import { layers, Network, CostTypes } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainResult, TrainEntry } from "../../../src/backends/index";
import { StatusTypes } from 'lysergic';
import { cost } from "../../../src/utils/cost";

const generator = new MersenneTwister(100010);
const random = generator.random_excl.bind(generator);

const emptySet: { training: TrainEntry[], test: TrainEntry[] } = { training: [], test: [] };



const targets = [2, 4];
const distractors = [3, 5];
const prompts = [0, 1];

const symbols = targets.length + distractors.length + prompts.length;

const baseNetwork = new Network({
  layers: [
    new layers.Input(symbols),
    new layers.LSTM(4),
    new layers.Dense(2)
  ],
  engineOptions: {
    generator: random,
    bias: true
  }
});




export class DSR extends PerformanceTest {
  costFunction: CostTypes = CostTypes.SOFTMAX;
  logEvery = 10000;
  maxIterations = 500000;
  minError = 0.008;
  learningRate = 0.03;

  async build(backend) {
    const network = baseNetwork.clone();

    network.backend = new backend(network.compiler);

    await network.build();

    return network;
  }

  async run(network: Network): Promise<TrainResult> {

    const generator = new MersenneTwister(10001);
    const random = generator.random_excl.bind(generator);

    let noRepeat = function (range, avoid) {
      let theNumber = random() * range | 0;
      let used = false;
      for (let i in avoid)
        if (theNumber == avoid[i])
          used = true;
      return used ? noRepeat(range, avoid) : theNumber;
    };

    let equal = function (prediction, output) {
      for (let i in prediction)
        if (Math.round(prediction[i]) != output[i])
          return false;
      return true;
    };


    network.compiler.engineStatus = StatusTypes.TRAINING;


    let length = 10;


    let predictedOutput: ArrayLike<number> = [];

    let trial, correct, i, j, success;
    trial = correct = i = j = success = 0;
    let error = 1;

    let results = {
      error,
      iterations: trial,
      time: 0,
      predictedOutput
    };

    let start = Date.now();

    let errorAvgAccumulator = 0;
    let prediction = null;
    while (trial < this.maxIterations) {
      // generate sequence
      let sequence = [],
        sequenceLength = length - prompts.length;

      let errorSet = [];

      for (i = 0; i < sequenceLength; i++) {
        let anyItem = random() * distractors.length | 0;
        sequence.push(distractors[anyItem]);
      }
      let indexes = [],
        positions = [];
      for (i = 0; i < prompts.length; i++) {
        indexes.push(random() * targets.length | 0);
        positions.push(noRepeat(sequenceLength, positions));
      }
      positions = positions.sort();
      for (i = 0; i < prompts.length; i++) {
        sequence[positions[i]] = targets[indexes[i]];
        sequence.push(prompts[i]);
      }

      // train sequence
      let distractorsCorrect;
      let targetsCorrect = distractorsCorrect = 0;
      error = 0;

      errorSet.length = 0;

      for (i = 0; i < length; i++) {
        // generate input from sequence
        let input = [];
        for (j = 0; j < symbols; j++)
          input[j] = 0;
        input[sequence[i]] = 1;

        // generate target output
        let output = [];
        for (j = 0; j < targets.length; j++)
          output[j] = 0;

        if (i >= sequenceLength) {
          let index = i - sequenceLength;
          output[indexes[index]] = 1;
        }

        // check result
        prediction = await network.activate(input);

        if (equal(prediction, output)) {
          if (i < sequenceLength) {
            distractorsCorrect++;
          } else {
            targetsCorrect++;
          }
        } else {
          await network.propagate(output);
        }

        let partialError = cost(output, prediction, this.costFunction);

        error += partialError;

        errorSet.push(partialError);

        if (distractorsCorrect + targetsCorrect == length)
          correct++;
      }

      // calculate error
      if (trial % 1000 == 0) {
        correct = 0;
      }

      trial++;
      let divideError = trial % 1000;
      divideError = divideError == 0 ? 1000 : divideError;
      success = correct / divideError;
      error /= length;

      errorAvgAccumulator += 1 - success;

      if (trial % this.logEvery == 0) {
        results = {
          error: errorAvgAccumulator / this.logEvery,
          iterations: trial,
          time: Date.now() - start,
          predictedOutput
        };

        this.log(results, errorSet);

        if ((errorAvgAccumulator / this.logEvery) < this.minError) {
          break;
        }

        errorAvgAccumulator = 0;
      }
    }

    if ((trial % this.logEvery) == 0) {
      error = 1 - success;
    } else {
      error = errorAvgAccumulator / (trial % this.logEvery);
    }

    results = {
      error,
      iterations: trial,
      time: Date.now() - start,
      predictedOutput
    };

    network.compiler.engineStatus = StatusTypes.IDLE;

    return results;
  }

  async getTrainigSet() {
    return emptySet.training;
  }

  async getTestingSet() {
    return emptySet.test;
  }

  async validate(network: Network, trainResult: TrainResult) {
    // let result = await network.activate([0, 0]);

    // if (Math.round(result[0]) != 0)
    //   throw new Error(`[0,0] did not output 0, got ${result[0]}`);

    // result = await network.activate([0, 1]);
    // if (Math.round(result[0]) != 0)
    //   throw new Error(`[0,1] did not output 0, got ${result[0]}`);

    // result = await network.activate([1, 0]);
    // if (Math.round(result[0]) != 0)
    //   throw new Error(`[1,0] did not output 0, got ${result[0]}`);

    // result = await network.activate([1, 1]);
    // if (Math.round(result[0]) != 1)
    //   throw new Error(`[1,1] did not output 1, got ${result[0]}`);
  }
};

export default new DSR;