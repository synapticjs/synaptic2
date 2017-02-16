import mnist from 'mnist';
import R from 'ramda';

const {training, test} = mnist.set(8000, 2000);

const to_xy = R.pipe(
    R.map(({input, output}) => [new Float32Array(input), new Float32Array(output)]),
    R.transpose
);

export const [x_train, y_train] = to_xy(training);
export const [x_test, y_test] = to_xy(test);