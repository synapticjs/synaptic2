var synaptic = process.env.NODE_ENV == 'node' ? require('../dist') : require('../dist/synaptic');

process.env.BACKEND = process.env.BACKEND || 'WASM'

var MersenneTwister = require('mersenne-twister')

var mnist = require('mnist')
var mnistSet = mnist.set(1000);

var generator = new MersenneTwister(100010);

var random = generator.random.bind(generator);

synaptic.Lysergic.RandomGenerator = () => random() * 2 - 1;

var lstm = new synaptic.Network(
  new synaptic.layers.Input2D(28, 28),
  new synaptic.layers.Dense(15),
  new synaptic.layers.Dense(10)
)

lstm.backend = new synaptic.backends[process.env.BACKEND](lstm.engine)
lstm.engine.random = random;
lstm.learningRate = 0.1;

lstm.backend.build().then(() => {

  console.time('MNIST')
  var trainer = new synaptic.Trainer(lstm)

  trainer.train(mnistSet.training, {
    learningRate: 0.1,
    minError: 0.0001,
    maxIterations: 30
  })
    .then(result => {
      console.timeEnd('MNIST')
      console.log(result)
    }, e => {
      console.error(e);
      console.error(e.stack);
    });
}, e => {
  console.error(e);
  console.error(e.stack);
})