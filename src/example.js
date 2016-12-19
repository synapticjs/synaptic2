var R = require('ramda');
var data = [
    {input: [0, 0], output: 0},
    {input: [1, 0], output: 1},
    {input: [0, 1], output: 1},
    {input: [1, 1], output: 0},
];

var activation_sigmoid = x => 1 / (1 + Math.exp(-x));
var derivative_sigmoid = x => {
    const fx = activation_sigmoid(x);
    return fx * (1 - fx);
};


var weights = {
    bias_h1: 0.9296917583304284,
    bias_h2: 0.22871896319953897,
    bias_o1: 0.7885197566582015,
    h1_o1: 0.7885197566582015,
    h2_o1: 0.45483438097508644,
    i1_h1: 0.22302726165640835,
    i1_h2: 0.8152578268058458,
    i2_h1: 0.05408151305826715,
    i2_h2: 0.4676811492495871,
}

function nn(i1, i2) {
    var h1_input =
        weights.i1_h1 * i1 +
        weights.i2_h1 * i2 +
        weights.bias_h1;
    var h1 = activation_sigmoid(h1_input);

    var h2_input =
        weights.i1_h2 * i1 +
        weights.i2_h2 * i2 +
        weights.bias_h2;
    var h2 = activation_sigmoid(h2_input);


    var o1_input =
        weights.h1_o1 * h1 +
        weights.h2_o1 * h2 +
        weights.bias_o1;

    var o1 = activation_sigmoid(o1_input);

    return o1;
}

var calculateResults = () =>
    console.log(data.map(({input: [i1, i2], output: y}) => Math.pow(y - nn(i1, i2), 2)));

var outputResults = () =>
    data.forEach(({input: [i1, i2], output: y}) =>
        console.log(`${i1} XOR ${i2} => ${nn(i1, i2)} (expected ${y})`));


var train = () => {
    const weight_deltas = {
        i1_h1: 0,
        i2_h1: 0,
        bias_h1: 0,
        i1_h2: 0,
        i2_h2: 0,
        bias_h2: 0,
        h1_o1: 0,
        h2_o1: 0,
        bias_o1: 0,
    };

    for (var {input: [i1, i2], output} of data) {
        //это код, просто скопированный из функции выше - чтобы научить сеть, нужно сначала делать проход вперед
        var h1_input =
            weights.i1_h1 * i1 +
            weights.i2_h1 * i2 +
            weights.bias_h1;
        var h1 = activation_sigmoid(h1_input);

        var h2_input =
            weights.i1_h2 * i1 +
            weights.i2_h2 * i2 +
            weights.bias_h2;
        var h2 = activation_sigmoid(h2_input);

        var o1_input =
            weights.h1_o1 * h1 +
            weights.h2_o1 * h2 +
            weights.bias_o1;

        var o1 = activation_sigmoid(o1_input);

        //Обучение начинается:
        // мы расчитываем разницу
        var delta = output - o1;
        // затем берем производную (и выкидываем 2 *, потому что это нам не так важно)
        var o1_delta = delta * derivative_sigmoid(o1_input);
        //и для нашей формулы вида w1 * h1 + w2 * h2 мы вначале пытаемся обновить веса w1 и w2

        console.log('delta', delta);
        weight_deltas.h1_o1 += h1 * o1_delta;
        weight_deltas.h2_o1 += h2 * o1_delta;
        weight_deltas.bias_o1 += o1_delta;

        console.log('derivatives o', derivative_sigmoid(o1_input));
        console.log('derivatives h', derivative_sigmoid(h1_input), derivative_sigmoid(h2_input));

        var h1_delta = o1_delta * derivative_sigmoid(h1_input);
        var h2_delta = o1_delta * derivative_sigmoid(h2_input);

        weight_deltas.i1_h1 += i1 * h1_delta;
        weight_deltas.i2_h1 += i2 * h1_delta;
        weight_deltas.bias_h1 += h1_delta;

        weight_deltas.i1_h2 += i1 * h2_delta;
        weight_deltas.i2_h2 += i2 * h2_delta;
        weight_deltas.bias_h2 += h2_delta;

        console.log(i1, i2);
        console.log(weight_deltas);
    }

    return weight_deltas;
}

var applyTrainUpdate = (weight_deltas = train()) =>
    Object.keys(weights).forEach(key =>
        weights[key] += weight_deltas[key]);

// R.range(0, 10000).forEach(() => applyTrainUpdate())
applyTrainUpdate();
outputResults();
// calculateResults();