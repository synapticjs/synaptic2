import {Network, ActivationLayer, DenseLayer, OutputLayer, Trainer, TrainerObjectives, RMSPropOptimizer} from '../src';

const XOR = new Network(
  DenseLayer([2], [3]),
  ActivationLayer('sigmoid'),
  DenseLayer([3], [1]),
  ActivationLayer('sigmoid'),
  OutputLayer([1])
)

const x = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

const y = [
  [0],
  [1],
  [1],
  [0],
]

const trainer = new Trainer(XOR, {
  optimizer: RMSPropOptimizer
});


trainer.train(x, y, {
    objective: TrainerObjectives.any([
      TrainerObjectives.max_categorical_crossentropy(.0005),
      TrainerObjectives.iterations(5000),
    ])
  }
)


it("should return near-0 value on [0,0]", function () {
  assert.isAtMost(XOR.activate([0, 0]), .49, "[0,0] did not output 0");
});

it("should return near-1 value on [0,1]", function () {
  assert.isAtLeast(XOR.activate([0, 1]), .51, "[0,1] did not output 1");
});

it("should return near-1 value on [1,0]", function () {
  assert.isAtLeast(XOR.activate([1, 0]), .51, "[1,0] did not output 1");
});

it("should return near-0 value on [1,1]", function () {
  assert.isAtMost(XOR.activate([1, 1]), .49, "[1,1] did not output 0");
});