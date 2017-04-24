var lstmJSON = require('../__tests__/mocks/lstm.json');
var samplesTimingTask = require('../__tests__/mocks/samples-timing-task');
var LSTMTimingTaskActivationMock = require('../__tests__/mocks/lstm-timing-task-activation');
var LSTMTimingTaskPropagationMock = require('../__tests__/mocks/lstm-timing-task-propagation');
var synaptic = process.env.NODE_ENV == 'node' ? require('../dist') : require('../dist/synaptic');

var MersenneTwister = require('mersenne-twister');

var generator = new MersenneTwister(100010);

var random = generator.random.bind(generator);

synaptic.Engine.RandomGenerator = () => random() * 2 - 1;


const COMPUTED_KEYS = [
  'state',
  'weight',
  'gain',
  'activation',
  'elegibilityTrace',
  'extendedElegibilityTrace',
  'errorResponsibility',
  'projectedErrorResponsibility',
  'gatedErrorResponsibility'
];

function copy(obj) {
  const copied = {}
  Object.keys(obj)
    .forEach(key => {
      if (typeof obj[key] === 'object') {
        copied[key] = copy(obj[key])
      } else {
        copied[key] = obj[key]
      }
    })
  return copied
}

function getTitle(key) {
  if (isNaN(Number(key))) {
    return `should compute ${key}`
  } else {
    return `unit ${key}`
  }
}

function isAlmostEqual(description, received, expected, precision, logLevel, level) {
  const log = typeof level === 'undefined' || level <= logLevel
  const spec = () => {
    Object.keys(expected)
      .forEach((key) => {
        if (level || COMPUTED_KEYS.indexOf(key) !== -1) {
          if (typeof received[key] === 'object') {
            isAlmostEqual(key, received[key], expected[key], precision, logLevel, (level | 0) + 1)
          } else {
            const precisionFn = typeof received[key] === 'number' ? 'toBeCloseTo' : 'toBe'
            const testFn = () => expect(received[key])[precisionFn](expected[key], precision)
            log ? test(getTitle(key), testFn) : testFn()
          }
        }
      })
  }
  if (log) {
    describe(!level ? description : getTitle(description), spec)
  } else {
    test(getTitle(description), spec)
  }
}

function getLSTM(Backend) {
  var json = JSON.parse(JSON.stringify(lstmJSON))
  var lstm = synaptic.Network.fromJSON(json)
  lstm.backend = new Backend(lstm.engine)
  lstm.engine.random = random;
  return lstm
}

function testActivationAndPropagation(Backend, precision, logLevel) {
  var lstm = getLSTM(Backend)
  lstm.activate(samplesTimingTask.train[0].input)
  isAlmostEqual('Activation', copy(lstm.engine), LSTMTimingTaskActivationMock, precision, logLevel)
  lstm.propagate(samplesTimingTask.train[0].output)
  isAlmostEqual('Propagation', copy(lstm.engine), LSTMTimingTaskPropagationMock, precision, logLevel)
}

function testTimingTask(Backend) {
  describe('Tasks', () => {

    var lstm = getLSTM(Backend)
    var trainer = new synaptic.Trainer(lstm)

    test('should pass Timing Task with an error lower than 0.05 in less than 200 iterations', done => {
      trainer.train(samplesTimingTask.train, {
        learningRate: 0.03,
        minError: 0.05,
        maxIterations: 200
      })
        .then(result => {
          expect(result.error).toBeLessThan(0.05);
          expect(result.iterations).toBeLessThan(200);
          done()
        })
    })
  })
}

function testDiscreteSequenceRecallTask(Backend, options) {
  describe('Tasks', () => {
    test('should pass Descrete Sequence Recall Task with at least 80% success rate in less than 100k iterations', done => {
      var lstm = new synaptic.Network(
        new synaptic.layers.Input(6),
        new synaptic.layers.LSTM(7),
        new synaptic.layers.Dense(2)
      )

      lstm.backend = new Backend(lstm.engine)
      lstm.engine.random = random;
      lstm.engine.seal()
      lstm.learningRate = 0.1;

      var targets = [2, 4];
      var distractors = [3, 5];
      var prompts = [0, 1];
      var length = 10;
      var criterion = 0.80;
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

      var results = {
        iterations: trial,
        success: success,
        error: error,
        time: Date.now() - start
      }

      expect(results.success).toBeGreaterThanOrEqual(0.8)
      expect(results.iterations).toBeLessThan(100 * 1000)
      done()
    })
  })
}

function testBackend(description, Backend, options) {
  describe(description, () => {
    testActivationAndPropagation(Backend, (options && options.precision) || 15, (options && options.logLevel) || 0)
    testTimingTask(Backend)
    //testDiscreteSequenceRecallTask(Backend);
  })
}

module.exports = testBackend
