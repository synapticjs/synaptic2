var lstmJSON = require('../__tests__/mocks/lstm.json');
var samplesTimingTask = require('../__tests__/mocks/samples-timing-task');
var LSTMTimingTaskActivationMock = require('../__tests__/mocks/lstm-timing-task-activation');
var LSTMTimingTaskPropagationMock = require('../__tests__/mocks/lstm-timing-task-propagation');
var synaptic = require('../dist/synaptic');

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
                    isAlmostEqual(key, received[key], expected[key], precision, logLevel, (level|0) + 1)
                } else {
                    const precisionFn = typeof received[key] === 'number' ? 'toBeCloseTo' : 'toBe'
                    const testFn = () => expect(received[key])[precisionFn](expected[key], precision)
                    log ? test(getTitle(key), testFn) : testFn()
                }
            }
        })
    }
    if (log){
        describe(!level ? description : getTitle(description), spec)
    } else {
        test(getTitle(description), spec)
    }
}

function getLSTM(Backend) {
    var json = JSON.parse(JSON.stringify(lstmJSON))
    var lstm = new synaptic.Network.fromJSON(json)
    lstm.backend = new Backend(lstm.engine)
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

    test('should pass Timing Task in less than 200 iterations', done => {
      trainer.train(samplesTimingTask.train, {
          learningRate: 0.03,
          minError: 0.05,
          maxIterations: 200
      })
      .then(result => {
        expect(result.iterations).toBeLessThan(200);
        done()
      })
    })
  })
}

function testDiscreteSequenceRecallTask(Backend, options) {
  describe('Tasks', () => {
    test('should pass Descrete Sequence Recall Task in less than 200 iterations', done => {
      var lstm = new synaptic.Network(
        new synaptic.layers.Input(6),
        new synaptic.layers.LSTM(7),
        new synaptic.layers.Dense(2)
      )

      lstm.backend = new Backend(lstm.engine)
      lstm.learningRate = 0.1;

      options = options || {};
      var targets = options.targets || [2, 4];
      var distractors = options.distractors || [3, 5, 6, 9];
      var prompts = options.prompts || [0, 1];
      var length = options.length || 10;
      var criterion = options.success || 0.80;
      var iterations = options.iterations || 100000;
      var rate = options.rate || .1;
      var log = options.log || 1000;
      var schedule = options.schedule || {};
      var cost = options.cost || this.cost || synaptic.Trainer.CostTypes.CROSS_ENTROPY;

      var trial, correct, i, j, success;
      trial = correct = i = j = success = 0;
      var error = 1,
        symbols = targets.length + distractors.length + prompts.length;

      var noRepeat = function(range, avoid) {
        var number = Math.random() * range | 0;
        var used = false;
        for (var i in avoid)
          if (number == avoid[i])
            used = true;
        return used ? noRepeat(range, avoid) : number;
      };

      var equal = function(prediction, output) {
        for (var i in prediction)
          if (Math.round(prediction[i]) != output[i])
            return false;
        return true;
      };

      var start = Date.now();

      while (trial < iterations && (success < criterion || trial % 1000 != 0)) {
        // generate sequence
        var sequence = [],
          sequenceLength = length - prompts.length;
        for (i = 0; i < sequenceLength; i++) {
          var any = Math.random() * distractors.length | 0;
          sequence.push(distractors[any]);
        }
        var indexes = [],
          positions = [];
        for (i = 0; i < prompts.length; i++) {
          indexes.push(Math.random() * targets.length | 0);
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

        // log
        if (log && trial % log == 0)
          console.log("iterations:", trial, " success:", success, " correct:",
            correct, " time:", Date.now() - start, " error:", error);
        if (schedule.do && schedule.every && trial % schedule.every == 0)
          schedule.do({
            iterations: trial,
            success: success,
            error: error,
            time: Date.now() - start,
            correct: correct
          });
      }

      var result = {
        iterations: trial,
        success: success,
        error: error,
        time: Date.now() - start
      }

      console.log(result)
      expect(result.success).toBeLessThan(0.9)
      done()
    })
  })
}

function testBackend(description, Backend, options) {
  describe(description, () => {
    //testActivationAndPropagation(Backend, (options && options.precision) || 15, (options && options.logLevel) || 0)
    testDiscreteSequenceRecallTask(Backend);
    //testTimingTask(Backend)
  })
}

module.exports = testBackend
