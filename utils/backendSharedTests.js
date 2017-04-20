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

function testBackend(description, Backend, options) {
  describe(description, () => {
    testActivationAndPropagation(Backend, (options && options.precision) || 15, (options && options.logLevel) || 0)
    testDiscreteSequenceRecallTask(Backend);
    testTimingTask(Backend)
  })
}

module.exports = testBackend
