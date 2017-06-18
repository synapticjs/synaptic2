import { Activations } from "lysergic";

export function randn(size: number, min = 0, max = 1, generator = Math.random): Float64Array {
  let array = new Float64Array(size);

  fillRandomArrayUnsigned(array, generator);

  // we use the random numbers as µ in the interpolation

  // interpolation = µ(b - a) + a

  scaleVector(array, max - min);
  addVector(array, min);

  // softMaxArray(array);

  return array;
}

export function scaleVector<T extends number[] | Float32Array | Float64Array>(array: T, scale: number) {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] *= scale;
    }
  return array;
}


export function addVector<T extends number[] | Float32Array | Float64Array>(array: T, num: number) {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] += num;
    }
  return array;
}

export function fillRandomArrayUnsigned<T extends number[] | Float32Array | Float64Array>(array: T, generator = Math.random): T {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] = generator(); // Domain of generator() must be (0,1)
    }
  return array;
}

export function softMaxArray(array: number[] | Float32Array | Float64Array, mult: number = 1) {
  // for all i ∈ array
  // sum = ∑ array[n]^e
  // i = î^e / sum
  // where the result ∑ array[0..n] = 1

  if (!(array && 'length' in array && array.length)) return;

  let sum = 0;

  // sum = ∑ array[n]^e
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.exp(mult * array[i]);
    sum += array[i];
  }

  if (sum != 0) {
    for (let i = 0; i < array.length; i++) array[i] /= sum;
  } else {
    let div = 1 / array.length;
    for (let i = 0; i < array.length; i++) array[i] = div;
  }

  return;
}

export function normalizeArray(array: number[] | Float32Array | Float64Array) {
  // normalize array to the R^(0..1) domain

  if (!(array && 'length' in array && array.length))
    return;

  let max = null, min = null;

  for (let i = 0; i < array.length; i++) {
    if (max === null || array[i] > max) max = array[i];
    if (min === null || array[i] < min) min = array[i];
  }

  let distance = max - min;

  if (distance == 0 && (min == 0 || max == 0)) return;

  if (distance == 0 && max != 0) {
    for (let i = 0; i < array.length; i++)
      array[i] = 1;
    return;
  };

  for (let i = 0; i < array.length; i++) {
    array[i] = (array[i] - min) / distance;
  }

  return;
}

// http://cs231n.github.io/neural-networks-2/
export function gaussianNormalization(array: number[] | Float32Array | Float64Array, num = 0) {
  let invSqrt = num == 0
    ? 1 / Math.sqrt(array.length)
    : 1 / Math.sqrt(num / array.length);

  for (let i = 0; i < array.length; i++) {
    array[i] = array[i] / invSqrt;
  }

  return;
}



// http://cs231n.github.io/neural-networks-2/
export function getWeightsFor(from: number, to: number, layerCount: number, layerIndex: number, activationType: Activations.ActivationTypes, generator = Math.random) {

  const layerFactor = 1 - layerIndex / layerCount;

  const units = from * to;

  let weights = normalDistribution(units, 0, 1, generator);

  if (activationType == Activations.ActivationTypes.TANH) {
    scaleVector(weights, 0.25 / Math.sqrt(to));
    return weights;
  }

  if (activationType == Activations.ActivationTypes.LOGISTIC_SIGMOID) {
    scaleVector(weights, 1 / Math.sqrt(to));
    scaleVector(weights, layerFactor);
    return weights;
  }

  scaleVector(weights, 0.00002 * layerFactor);
  addVector(weights, 0.001);

  return weights;
}

export function normalDistribution(size: number, mean: number = 0, stdDev: number = 1, generator = Math.random) {
  // Adapted from http://blog.yjl.im/2010/09/simulating-normal-random-variable-using.html

  let toReturn = new Float64Array(size);

  for (let i = 0; i < size; i++) {
    let V1, V2, S, X;

    do {
      let U1 = generator();
      let U2 = generator();
      V1 = (2 * U1) - 1;
      V2 = (2 * U2) - 1;
      S = (V1 * V1) + (V2 * V2);
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    X = mean + stdDev * X;
    toReturn[i] = X;
  }

  return toReturn;
}