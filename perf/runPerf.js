var synaptic = process.env.NODE_ENV == 'node' ? require('../dist/src') : require('../dist/synaptic');
var printer = require('./printer')
process.env.BACKEND = process.env.BACKEND || 'WASM'

var MersenneTwister = require('mersenne-twister')

var generator = new MersenneTwister(100010);

var random = generator.random.bind(generator);

synaptic.Lysergic.RandomGenerator = () => random() * 2 - 1;

var lstm = new synaptic.Network(
  new synaptic.layers.Input(6),
  new synaptic.layers.LSTM(4),
  new synaptic.layers.Dense(2, synaptic.Lysergic.ActivationTypes.GAUSSIAN)
)

lstm.backend = new synaptic.backends[process.env.BACKEND](lstm.engine)
lstm.engine.random = random;
lstm.learningRate = 0.03;

lstm.engine.status = synaptic.Lysergic.StatusTypes.TRAINING

var logEvery = 2500;

async function test() {

  await lstm.build()

  console.time('LSTM')

  var targets = [2, 4];
  var distractors = [3, 5];
  var prompts = [0, 1];
  var length = 10;
  var maxError = 0.01;
  var iterations = 500000;
  var schedule = {};

  var cost = synaptic.Lysergic.CostTypes.CROSS_ENTROPY;

  var trial, correct, i, j, success;
  trial = correct = i = j = success = 0;
  var error = 1,
    symbols = targets.length + distractors.length + prompts.length;

  var noRepeat = function (range, avoid) {
    var number = random() * range | 0;
    var used = false;
    for (var i in avoid)
      if (number == avoid[i])
        used = true;
    return used ? noRepeat(range, avoid) : number;
  };

  var equal = function (prediction, output) {
    for (var i in prediction)
      if (Math.round(prediction[i]) != output[i])
        return false;
    return true;
  };

  var start = Date.now();

  var errorAvgAccumulator = 0;
  var prediction = null;
  while (trial < iterations) {
    // generate sequence
    var sequence = [],
      sequenceLength = length - prompts.length;
    for (i = 0; i < sequenceLength; i++) {
      var any = random() * distractors.length | 0;
      sequence.push(distractors[any]);
    }
    var indexes = [],
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

    //train sequence
    var distractorsCorrect;
    var targetsCorrect = distractorsCorrect = 0;
    error = 0;
    for (i = 0; i < length; i++) {
      // generate input from sequence
      var input = [];
      for (j = 0; j < symbols; j++)
        input[j] = 0;
      input[sequence[i]] = 1;

      // generate target output
      var output = [];
      for (j = 0; j < targets.length; j++)
        output[j] = 0;

      if (i >= sequenceLength) {
        var index = i - sequenceLength;
        output[indexes[index]] = 1;
      }

      // check result
      prediction = await lstm.activate(input);

      if (equal(prediction, output))
        if (i < sequenceLength)
          distractorsCorrect++;
        else
          targetsCorrect++;
      else {
        await lstm.propagate(output);
      }

      error += synaptic.Lysergic.costFunction(output, prediction, synaptic.Lysergic.CostTypes.CROSS_ENTROPY);

      if (distractorsCorrect + targetsCorrect == length)
        correct++;
    }

    // calculate error
    if (trial % 1000 == 0) {
      correct = 0;
    }

    trial++;
    var divideError = trial % 1000;
    divideError = divideError == 0 ? 1000 : divideError;
    success = correct / divideError;
    error /= length;

    errorAvgAccumulator += 1 - success;

    if (trial % logEvery == 0) {
      printer.printError(errorAvgAccumulator / logEvery);

      if ((errorAvgAccumulator / logEvery) < maxError) {
        break;
      }

      errorAvgAccumulator = 0;
    }
  }

  if ((trial % logEvery) == 0) {
    error = 1 - success;
  } else {
    error = errorAvgAccumulator / (trial % logEvery);
  }

  var results = {
    iterations: trial,
    success: success,
    error,
    time: Date.now() - start
  }

  lstm.engine.status = synaptic.Lysergic.StatusTypes.IDLE

  console.timeEnd('LSTM')
  console.log({
    iterations: trial,
    error: error,
    time: Date.now() - start,
    success: error < maxError
  });
}

test();