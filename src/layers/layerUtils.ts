export function createRandomWeights(size: number): Float64Array {
  let array = new Float64Array(size);

  fillRandomArrayUnsigned(array);

  // softMaxArray(array);

  return array;
}

export function fillRandomArrayUnsigned<T extends number[] | Float32Array | Float64Array>(array: T): T {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] = 0.0001 * Math.random();
    }
  return array;
}

export function fillRandomArraySigned<T extends number[] | Float32Array | Float64Array>(array: T): T {
  if (array && 'length' in array && array.length)
    for (let i = 0; i < array.length; i++) {
      array[i] = 0.0002 * (Math.random() - 0.5);
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
