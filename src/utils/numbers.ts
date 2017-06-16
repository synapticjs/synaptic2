import { ActivationTypes } from "lysergic";

export function randn(size: number, min = 0, max = 1, generator = Math.random): Float64Array {
  let array = new Float64Array(size);

  fillRandomArrayUnsigned(array, generator);

  let scale = max - min;

  scaleVector(array, scale);
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


export function addVector<T extends number[] | Float32Array | Float64Array>(array: T, scale: number) {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] += scale;
    }
  return array;
}

export function fillRandomArrayUnsigned<T extends number[] | Float32Array | Float64Array>(array: T, generator = Math.random): T {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] = 0.0002 * generator();
    }
  return array;
}

export function fillRandomArraySigned<T extends number[] | Float32Array | Float64Array>(array: T, generator = Math.random): T {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] = 0.02 * (generator() * 2 - 1) + 0.1;
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
export function getWeightsFor(units: number, activationType: ActivationTypes, generator = Math.random) {
  let weights = randn(units, 0, 1, generator);

  if (activationType == ActivationTypes.SOFTMAX) {
    // http://cs231n.github.io/neural-networks-2/
    gaussianNormalization(weights, 2);
    return weights;
  }

  if (activationType == ActivationTypes.TANH) {
    gaussianNormalization(weights, 2);
    return weights;
  }

  if (activationType == ActivationTypes.LOGISTIC_SIGMOID) {
    gaussianNormalization(weights, 2);
    scaleVector(weights, 4);
    return weights;
  }


  scaleVector(weights, 0.002);
  addVector(weights, 0.001);


  return weights;
}
