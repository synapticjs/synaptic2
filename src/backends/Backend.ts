declare var console
import Lysergic, { CostTypes, StatusTypes, ActivationTypes } from 'lysergic';

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
  log?: (partial: TrainResult, errorSet: ArrayLike<number>) => void;
  every?: (predicted: ArrayLike<number>, target: ArrayLike<number>, error: number, iteration: number) => void;
}

export interface TrainResult {
  error: number;
  iterations: number;
  time: number;
  predictedOutput: ArrayLike<number>;
}

export abstract class Backend {
  built = false;

  constructor(public engine = new Lysergic()) { }
  abstract activate(inputs: number[]): Promise<ArrayLike<number>>;
  abstract propagate(targets: number[]): Promise<void>;

  async train(dataset: TrainEntry[], { learningRate, minError, maxIterations, costFunction, log, logEvery, every }: TrainOptions): Promise<TrainResult> {
    if (!this.built) {
      await this.build();
    }

    console.log('Using cost function ' + CostTypes[costFunction]);

    // start training
    let startTime = new Date().getTime();
    let error = Infinity;
    let iterations = 0;

    this.engine.learningRate = learningRate;
    this.engine.status = StatusTypes.TRAINING;
    let predictedOutput: ArrayLike<number> = null;

    // train
    while (error > minError && iterations < maxIterations) {
      error = 0;
      let errorSet = [];
      for (let index = 0; index < dataset.length; index++) {
        const { input, output } = dataset[index];
        predictedOutput = await this.activate(input);
        let partialError = Lysergic.costFunction(output, predictedOutput, costFunction);
        await this.propagate(output);
        errorSet.push(partialError);
        error += partialError;

        every && every(predictedOutput, output, partialError, iterations);
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
    }

    // end training
    this.engine.status = StatusTypes.IDLE;

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


export function activationFunction(x: number, type: ActivationTypes): number {
  switch (type) {
    case ActivationTypes.LOGISTIC_SIGMOID:
      return 1 / (1 + Math.exp(-x));

    case ActivationTypes.TANH:
      const eP = Math.exp(x);
      const eN = 1 / eP;
      return (eP - eN) / (eP + eN);

    case ActivationTypes.RELU:
      return x > 0 ? x : 0;

    // Required for NTM
    case ActivationTypes.RELU_PLUSONE:
      return 1 + (x > 0 ? x : 0);

    // https://en.wikipedia.org/wiki/Gaussian_function
    case ActivationTypes.GAUSSIAN:
      const pow = x * x;
      return Math.exp(-pow);

    // Glorot, Xavier, Antoine Bordes, and Yoshua Bengio. "Deep sparse rectifier neural networks." International Conference on Artificial Intelligence and Statistics. 2011.
    case ActivationTypes.SOFTPLUS:
      return Math.log(1 + Math.exp(x));

    // http://www.iro.umontreal.ca/~lisa/publications2/index.php/attachments/single/205
    // http://jmlr.org/proceedings/papers/v9/glorot10a/glorot10a.pdf
    case ActivationTypes.SOFTSIGN:
      return x / (1 + Math.abs(x));

    case ActivationTypes.EXP:
      return Math.exp(x);

    case ActivationTypes.IDENTITY:
      return x;

    case ActivationTypes.INVERSE_IDENTITY:
      return 1 / x;

    case ActivationTypes.STEP:
      return x > 0 ? 1 : 0;

    default:
      return 0;
  }
}

export function activationFunctionDerivative(x: number, fx: number, type: ActivationTypes): number {
  switch (type) {
    case ActivationTypes.LOGISTIC_SIGMOID:
      return fx * (1 - fx);

    case ActivationTypes.TANH:
      return 1 - (fx * fx);

    case ActivationTypes.IDENTITY:
      return 1;

    case ActivationTypes.GAUSSIAN:
      return -2 * x * fx;

    case ActivationTypes.RELU_PLUSONE:
    case ActivationTypes.RELU:
      return x > 0 ? 1 : 0;

    case ActivationTypes.SOFTPLUS:
      return 1 / (1 + Math.exp(-x));

    case ActivationTypes.SOFTSIGN:
      const aux = 1 + Math.abs(x);
      return 1 / (aux * aux);

    case ActivationTypes.EXP:
      return fx;

    case ActivationTypes.INVERSE_IDENTITY:
      return -(1 / (x * x));

    case ActivationTypes.STEP:
      return 0;

    // TODO: REVIEW HOW TO DERIVATE WITH THE GENERALIZED ALGORIHM
    default:
      return 0;
  }
}
