declare var console;
import Lysergic, { Activations, StatusTypes } from 'lysergic';
import { CostTypes } from "../index";
import { cost } from "../utils/cost";

export interface Dictionary<T> {
  [key: string]: T;
}

export interface TrainEntry {
  input: number[];
  output: number[];
}

export interface TrainOptions {
  learningRate?: number;
  minError?: number;
  maxIterations?: number;
  costFunction?: CostTypes;
  logEvery?: number;
  momentum?: number;
  log?: (partial: TrainResult, errorSet: ArrayLike<number>) => void;
  every?: (predicted: ArrayLike<number>, target: ArrayLike<number>, error: number, iteration: number) => void;
}

export interface TrainResult {
  error: number;
  iterations: number;
  time: number;
  predictedOutput: ArrayLike<number>;
}


export function logDimension(dimension: string, compiler: Lysergic) {
  let variables = compiler.heap.getVariables().filter($ => $.key.startsWith(dimension));

  console.log('Dimension ' + dimension);
  variables.map($ => {
    let label = compiler.heap.memory.length > $.position
      ? compiler.heap.memory[$.position]
      : `Position ${$.position} doesn't exist. Max: ${compiler.heap.memory.length}`;
    console.log(`  *(${$.position}) = ${$.key} = ${label}`);
  });
}


export function logDimensionMean(dimension: string, compiler: Lysergic) {
  let variables = compiler.heap.getVariables().filter($ => $.key.startsWith(dimension));
  let acc = 0;
  variables.map($ => {
    acc += compiler.heap.memory[$.position];
  });

  console.log('Dimension ' + dimension + ' mean = ' + (acc / variables.length));
}


export abstract class Backend {
  built = false;

  constructor(public compiler = new Lysergic()) { }

  async activate(inputs: number[]): Promise<ArrayLike<number>> {
    throw new Error('Activate is not implemented');
  }

  async propagate(targets: number[]) {
    throw new Error('Propagate is not implemented');
  }

  async train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction, log, logEvery, every, momentum }: TrainOptions): Promise<TrainResult> {
    if (!this.built) {
      await this.compiler.build();
    }

    // console.log('Before activation:');
    // console.dir(this.compiler.toJSON());
    // console.log('Using cost function ' + CostTypes[costFunction]);

    // start training
    let startTime = new Date().getTime();
    let error = Infinity;
    let iterations = 0;

    this.compiler.learningRate = learningRate;
    this.compiler.engineStatus = StatusTypes.TRAINING;
    let predictedOutput: ArrayLike<number> = null;

    // train
    while (error > minError && iterations < maxIterations) {

      if (momentum) {
        this.compiler.momentum = momentum * (maxIterations - iterations) / maxIterations;
      }

      error = 0;
      let errorSet = [];
      for (let index = 0; index < dataset.length; index++) {
        const { input, output } = dataset[index];

        // console.log('Before activation:');
        // logDimension('activation', this.compiler);
        // logDimension('weight', this.compiler);
        // logDimension('state', this.compiler);
        predictedOutput = await this.activate(input);

        // console.log('After activation:');
        // console.dir(this.compiler.toJSON());
        // logDimension('activation', this.compiler);
        // logDimension('weight', this.compiler);
        // logDimension('state', this.compiler);

        let partialError = cost(output, predictedOutput, costFunction);

        await this.propagate(output);
        // console.log('\x1B[?25l\x1Bc');
        // logDimension('activation', this.compiler);
        // logDimension('weight', this.compiler);
        // logDimension('state', this.compiler);
        // console.log(' ');
        // console.log('After propagation:');
        // console.dir(this.compiler.toJSON());

        errorSet.push(partialError);
        error += partialError;

        every && every(predictedOutput, output, partialError, iterations);

        // break;
      }
      error /= dataset.length;

      iterations++;
      if (log) {
        const partialResult = {
          error,
          iterations,
          time: new Date().getTime() - startTime,
          predictedOutput
        };
        if (logEvery && logEvery > 1) {
          if ((iterations % logEvery) == 0) {
            log(partialResult, errorSet);
          }
        } else log(partialResult, errorSet);
      }
      // break;
    }

    // end training
    this.compiler.engineStatus = StatusTypes.IDLE;

    return {
      error,
      iterations,
      time: new Date().getTime() - startTime,
      predictedOutput
    };
  }

  async build() {
    this.built = true;
  }
}


export function activationFunction(x: number, type: Activations.ActivationTypes): number {
  switch (type) {
    case Activations.ActivationTypes.LOGISTIC_SIGMOID:
      return 1 / (1 + Math.exp(-x));

    case Activations.ActivationTypes.TANH:
      const eP = Math.exp(x);
      const eN = 1 / eP;
      return (eP - eN) / (eP + eN);

    case Activations.ActivationTypes.RELU:
      return x > 0 ? x : 0;

    // Required for NTM
    case Activations.ActivationTypes.RELU_PLUSONE:
      return 1 + (x > 0 ? x : 0);

    // https://en.wikipedia.org/wiki/Gaussian_function
    case Activations.ActivationTypes.GAUSSIAN:
      const pow = x * x;
      return Math.exp(-pow);

    // Glorot, Xavier, Antoine Bordes, and Yoshua Bengio. "Deep sparse rectifier neural networks." International Conference on Artificial Intelligence and Statistics. 2011.
    case Activations.ActivationTypes.SOFTPLUS:
      return Math.log(1 + Math.exp(x));

    // http://www.iro.umontreal.ca/~lisa/publications2/index.php/attachments/single/205
    // http://jmlr.org/proceedings/papers/v9/glorot10a/glorot10a.pdf
    case Activations.ActivationTypes.SOFTSIGN:
      return x / (1 + Math.abs(x));

    case Activations.ActivationTypes.EXP:
      return Math.exp(x);

    case Activations.ActivationTypes.IDENTITY:
      return x;

    case Activations.ActivationTypes.INVERSE_IDENTITY:
      return 1 / x;

    case Activations.ActivationTypes.STEP:
      return x > 0 ? 1 : 0;

    default:
      return 0;
  }
}

export function activationFunctionDerivative(x: number, fx: number, type: Activations.ActivationTypes): number {
  switch (type) {
    case Activations.ActivationTypes.LOGISTIC_SIGMOID:
      return fx * (1 - fx);

    case Activations.ActivationTypes.TANH:
      return 1 - (fx * fx);

    case Activations.ActivationTypes.IDENTITY:
      return 1;

    case Activations.ActivationTypes.GAUSSIAN:
      return -2 * x * fx;

    case Activations.ActivationTypes.RELU_PLUSONE:
    case Activations.ActivationTypes.RELU:
      return x > 0 ? 1 : 0;

    case Activations.ActivationTypes.SOFTPLUS:
      return 1 / (1 + Math.exp(-x));

    case Activations.ActivationTypes.SOFTSIGN:
      const aux = 1 + Math.abs(x);
      return 1 / (aux * aux);

    case Activations.ActivationTypes.EXP:
      return fx;

    case Activations.ActivationTypes.INVERSE_IDENTITY:
      return -(1 / (x * x));

    case Activations.ActivationTypes.STEP:
      return 0;

    // TODO: REVIEW HOW TO DERIVATE WITH THE GENERALIZED ALGORIHM
    default:
      return 0;
  }
}
