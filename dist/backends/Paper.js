"use strict";
var Engine_1 = require("../Engine");
var Trainer_1 = require("../Trainer");
var Paper = (function () {
    function Paper(engine) {
        if (engine === void 0) { engine = new Engine_1.default(); }
        this.engine = engine;
        this.activateUnit = this.activateUnit.bind(this);
        this.propagateUnit = this.propagateUnit.bind(this);
        this.activate = this.activate.bind(this);
        this.propagate = this.propagate.bind(this);
        this.bigParenthesisTerm = this.bigParenthesisTerm.bind(this);
        this.activationFunction = this.activationFunction.bind(this);
        this.activationFunctionDerivative = this.activationFunctionDerivative.bind(this);
        this.costFunction = this.costFunction.bind(this);
        this.train = this.train.bind(this);
    }
    Paper.prototype.activateUnit = function (unit, input) {
        var j = unit;
        var s = this.engine.state;
        var w = this.engine.weight;
        var g = this.engine.gain;
        var y = this.engine.activation;
        var f = this.activationFunction;
        var df = this.activationFunctionDerivative;
        var ε = this.engine.elegibilityTrace;
        var xε = this.engine.extendedElegibilityTrace;
        var inputSet = this.engine.inputSet;
        var gatedBy = this.engine.gatedBy;
        var inputsOfGatedBy = this.engine.inputsOfGatedBy;
        if (typeof input !== 'undefined') {
            y[j] = input;
        }
        else {
            s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputSet[j], function (i) { return g[j][i] * w[j][i] * y[i]; });
            y[j] = f(j);
            for (var _i = 0, _a = inputSet[j]; _i < _a.length; _i++) {
                var i = _a[_i];
                ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i];
                for (var _b = 0, _c = gatedBy[j]; _b < _c.length; _b++) {
                    var k = _c[_b];
                    xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df(j) * ε[j][i] * this.bigParenthesisTerm(k, j);
                }
            }
            for (var _d = 0, _e = gatedBy[unit]; _d < _e.length; _d++) {
                var to = _e[_d];
                for (var _f = 0, _g = inputsOfGatedBy[to][unit]; _f < _g.length; _f++) {
                    var from = _g[_f];
                    g[to][from] = y[unit];
                }
            }
        }
        return y[j];
    };
    Paper.prototype.propagateUnit = function (unit, target) {
        var _this = this;
        var j = unit;
        var s = this.engine.state;
        var w = this.engine.weight;
        var g = this.engine.gain;
        var y = this.engine.activation;
        var df = this.activationFunctionDerivative;
        var δ = this.engine.errorResponsibility;
        var δP = this.engine.projectedErrorResponsibility;
        var δG = this.engine.gatedErrorResponsibility;
        var α = this.engine.learningRate;
        var ε = this.engine.elegibilityTrace;
        var xε = this.engine.extendedElegibilityTrace;
        var P = this.engine.projectionSet;
        var G = this.engine.gateSet;
        var inputSet = this.engine.inputSet;
        if (typeof target !== 'undefined') {
            δ[j] = δP[j] = target - y[j];
        }
        else {
            δP[j] = df(j) * Σ(P[j], function (k) { return δ[k] * g[k][j] * w[k][j]; });
            δG[j] = df(j) * Σ(G[j], function (k) { return δ[k] * _this.bigParenthesisTerm(k, j); });
            δ[j] = δP[j] + δG[j];
        }
        var _loop_1 = function (i) {
            var Δw = α * δP[j] * ε[j][i] + α * Σ(G[j], function (k) { return δ[k] * xε[j][i][k]; });
            w[j][i] += Δw;
        };
        for (var _i = 0, _a = inputSet[j]; _i < _a.length; _i++) {
            var i = _a[_i];
            _loop_1(i);
        }
    };
    Paper.prototype.bigParenthesisTerm = function (k, j) {
        var w = this.engine.weight;
        var s = this.engine.state;
        var y = this.engine.activation;
        var dt = this.engine.derivativeTerm[k][j];
        var units = this.engine.inputsOfGatedBy[k][j];
        return dt * w[k][k] * s[k] + Σ(units.filter(function (a) { return a !== k; }), function (a) { return w[k][a] * y[a]; });
    };
    Paper.prototype.activationFunction = function (unit) {
        var _this = this;
        var x;
        var type = this.engine.activationFunction[unit];
        switch (type) {
            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
                x = this.engine.state[unit];
                return 1 / (1 + Math.exp(-x));
            case Engine_1.ActivationTypes.TANH:
                x = this.engine.state[unit];
                var eP = Math.exp(x);
                var eN = 1 / eP;
                return (eP - eN) / (eP + eN);
            case Engine_1.ActivationTypes.RELU:
                x = this.engine.state[unit];
                return x > 0 ? x : 0;
            case Engine_1.ActivationTypes.IDENTITY:
                x = this.engine.state[unit];
                return x;
            case Engine_1.ActivationTypes.MAX_POOLING:
                var inputUnit = this.engine.inputsOf[unit][0];
                var gatedUnit = this.engine.gatedBy[unit][0];
                var inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit];
                var maxActivation_1 = inputsOfGatedUnit.reduce(function (max, input) { return Math.max(_this.engine.activation[input], max); }, -Infinity);
                var inputUnitWithHigherActivation = inputsOfGatedUnit.find(function (input) { return _this.engine.activation[input] === maxActivation_1; });
                return inputUnitWithHigherActivation === inputUnit ? 1 : 0;
            case Engine_1.ActivationTypes.DROPOUT:
                var chances = this.engine.state[unit];
                return this.engine.random() < chances && this.engine.status === Engine_1.StatusTypes.TRAINING ? 0 : 1;
        }
    };
    Paper.prototype.activationFunctionDerivative = function (unit) {
        var x;
        var type = this.engine.activationFunction[unit];
        switch (type) {
            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
                x = this.activationFunction(unit);
                return x * (1 - x);
            case Engine_1.ActivationTypes.TANH:
                x = this.activationFunction(unit);
                return 1 - Math.pow(x, 2);
            case Engine_1.ActivationTypes.RELU:
                return 0;
            case Engine_1.ActivationTypes.IDENTITY:
                return 0;
            case Engine_1.ActivationTypes.MAX_POOLING:
                return 0;
            case Engine_1.ActivationTypes.DROPOUT:
                return 0;
        }
    };
    Paper.prototype.costFunction = function (target, predicted, costType) {
        var i, x = 0;
        switch (costType) {
            case Trainer_1.CostTypes.MSE:
                for (i = 0; i < target.length; i++) {
                    x += Math.pow(target[i] - predicted[i], 2);
                }
                return x / target.length;
            case Trainer_1.CostTypes.CROSS_ENTROPY:
                for (i = 0; i < target.length; i++) {
                    x -= (target[i] * Math.log(predicted[i] + 1e-15)) + ((1 - target[i]) * Math.log((1 + 1e-15) - predicted[i]));
                }
                return x;
            case Trainer_1.CostTypes.BINARY:
                for (i = 0; i < target.length; i++) {
                    x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0;
                }
                return x;
        }
    };
    Paper.prototype.activate = function (inputs) {
        var _this = this;
        this.engine.status = Engine_1.StatusTypes.ACTIVATING;
        var activations = this.engine.layers.map(function (layer, layerIndex) {
            return layer.map(function (unit, unitIndex) {
                var input = layerIndex === 0 ? inputs[unitIndex] : void 0;
                return _this.activateUnit(unit, input);
            });
        });
        this.engine.status = Engine_1.StatusTypes.IDLE;
        return activations.pop();
    };
    Paper.prototype.propagate = function (targets) {
        var _this = this;
        this.engine.status = Engine_1.StatusTypes.PROPAGATING;
        this.engine.layers
            .slice(1)
            .reverse()
            .forEach(function (layer, layerIndex) {
            layer
                .slice()
                .reverse()
                .forEach(function (unit, unitIndex) {
                var target = layerIndex === 0 ? targets[unitIndex] : void 0;
                _this.propagateUnit(unit, target);
            });
        });
        this.engine.status = Engine_1.StatusTypes.IDLE;
    };
    Paper.prototype.train = function (dataset, _a) {
        var _this = this;
        var learningRate = _a.learningRate, minError = _a.minError, maxIterations = _a.maxIterations, costFunction = _a.costFunction;
        console.log({ learningRate: learningRate, minError: minError, maxIterations: maxIterations, costFunction: costFunction });
        return new Promise(function (resolve) {
            var startTime = new Date().getTime();
            var error = Infinity;
            var iterations = 0;
            _this.engine.learningRate = learningRate;
            _this.engine.status = Engine_1.StatusTypes.TRAINING;
            while (error > minError && iterations < maxIterations) {
                error = 0;
                for (var _i = 0, dataset_1 = dataset; _i < dataset_1.length; _i++) {
                    var data = dataset_1[_i];
                    var input = data.input, output = data.output;
                    var predictedOutput = _this.activate(input);
                    _this.propagate(output);
                    error += _this.costFunction(output, predictedOutput, costFunction);
                }
                error /= dataset.length;
                iterations++;
                console.log({
                    error: error,
                    iterations: iterations,
                    time: new Date().getTime() - startTime
                });
            }
            _this.engine.status = Engine_1.StatusTypes.IDLE;
            resolve({
                error: error,
                iterations: iterations,
                time: new Date().getTime() - startTime
            });
        });
    };
    return Paper;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Paper;
function Σ(indexes, fn) {
    var acumulator = 0;
    for (var i = 0; i < indexes.length; i++) {
        acumulator += fn(indexes[i]);
    }
    return acumulator;
}
//# sourceMappingURL=Paper.js.map
