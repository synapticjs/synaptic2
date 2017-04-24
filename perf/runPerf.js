var synaptic = process.env.NODE_ENV == 'node' ? require('../dist') : require('../dist/synaptic');

process.env.BACKEND = process.env.BACKEND || 'ASM'

var MersenneTwister = require('mersenne-twister')

var generator = new MersenneTwister(100010);

var random = generator.random.bind(generator);

synaptic.Engine.RandomGenerator = () => random() * 2 - 1;

var lstm = new synaptic.Network(
  new synaptic.layers.Input(6),
  new synaptic.layers.LSTM(7),
  new synaptic.layers.Dense(2)
)

lstm.backend = new synaptic.backends[process.env.BACKEND](lstm.engine)
lstm.engine.random = random;
lstm.learningRate = 0.1;

lstm.backend.asm = lstm.backend.buildAsm()
console.log(lstm.backend.asm.module.activate.toString())


lstm.engine.seal()
lstm.engine.status = synaptic.Engine.StatusTypes.TRAINING

var targets = [2, 4];
var distractors = [3, 5];
var prompts = [0, 1];
var length = 10;
var criterion = 0.5;
var iterations = 100000;
var rate = .1;
var schedule = {};
var cost = synaptic.Trainer.CostTypes.CROSS_ENTROPY;

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
console.time('LSTM')
while (trial < iterations && success < criterion) {
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
    var prediction = lstm.activate(input);

    if (equal(prediction, output))
      if (i < sequenceLength)
        distractorsCorrect++;
      else
        targetsCorrect++;
    else {
      lstm.propagate(output);
    }

    error += lstm.backend.costFunction(output, prediction, synaptic.Trainer.CostTypes.CROSS_ENTROPY);

    if (distractorsCorrect + targetsCorrect == length)
      correct++;
  }

  // calculate error
  if (trial % 1000 == 0)
    correct = 0;
  trial++;
  var divideError = trial % 1000;
  divideError = divideError == 0 ? 1000 : divideError;
  success = correct / divideError;
  error /= length;
}

lstm.engine.status = synaptic.Engine.StatusTypes.IDLE

console.timeEnd('LSTM')
console.log({
  iterations: trial,
  success: success,
  error: error,
  time: Date.now() - start
})