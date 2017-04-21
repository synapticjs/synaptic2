// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Engine_1 = require("../Engine");
var Trainer_1 = require("../Trainer");
var CPU = (function () {
    function CPU(engine) {
        if (engine === void 0) { engine = new Engine_1.default(); }
        this.engine = engine;
    }
    CPU.prototype.activateUnit = function (j, input) {
        var engine = this.engine;
        var weight = engine.weight;
        var gain = engine.gain;
        var gatedBy = engine.gatedBy[j];
        var activation = engine.activation;
        var inputSet = engine.inputSet[j];
        var inputsOfGatedBy = engine.inputsOfGatedBy;
        var state = engine.state;
        var extElegibilityTrace = null;
        var elegibilityTrace = null;
        if (typeof input !== 'undefined') {
            activation[j] = input;
        }
        else {
            var i = void 0, k = void 0, h = void 0, g = void 0, to = void 0, from = void 0;
            state[j] *= gain[j][j] * weight[j][j];
            for (h = 0; h < inputSet.length; h++) {
                i = inputSet[h];
                state[j] += gain[j][i] * weight[j][i] * activation[i];
            }
            activation[j] = this.activationFunction(j);
            for (h = 0; h < inputSet.length; h++) {
                i = inputSet[h];
                elegibilityTrace = engine.elegibilityTrace[j][i];
                engine.elegibilityTrace[j][i] = gain[j][j] * weight[j][j] * elegibilityTrace + gain[j][i] * activation[i];
                for (g = 0; g < gatedBy.length; g++) {
                    k = gatedBy[g];
                    extElegibilityTrace = engine.extendedElegibilityTrace[j][i];
                    extElegibilityTrace[k] = gain[k][k] * weight[k][k] * extElegibilityTrace[k] + this.activationFunctionDerivative(j) * elegibilityTrace * this.bigParenthesisTerm(k, j);
                }
            }
            for (h = 0; h < gatedBy.length; h++) {
                to = gatedBy[h];
                for (g = 0; g < inputsOfGatedBy[to][j].length; g++) {
                    from = inputsOfGatedBy[to][j][g];
                    gain[to][from] = activation[j];
                }
            }
        }
        return activation[j];
    };
    CPU.prototype.propagateUnit = function (j, target) {
        var i, k, h, g;
        if (typeof target !== 'undefined') {
            this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] = target - this.engine.activation[j];
        }
        else {
            this.engine.projectedErrorResponsibility[j] = 0;
            for (h = 0; h < this.engine.projectionSet[j].length; h++) {
                k = this.engine.projectionSet[j][h];
                this.engine.projectedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.engine.gain[k][j] * this.engine.weight[k][j];
            }
            var derivative = this.activationFunctionDerivative(j);
            this.engine.projectedErrorResponsibility[j] *= derivative;
            this.engine.gatedErrorResponsibility[j] = 0;
            for (h = 0; h < this.engine.gateSet[j].length; h++) {
                k = this.engine.gateSet[j][h];
                this.engine.gatedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.bigParenthesisTerm(k, j);
            }
            this.engine.gatedErrorResponsibility[j] *= derivative;
            this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] + this.engine.gatedErrorResponsibility[j];
        }
        for (h = 0; h < this.engine.inputSet[j].length; h++) {
            i = this.engine.inputSet[j][h];
            var Δw = this.engine.projectedErrorResponsibility[j] * this.engine.elegibilityTrace[j][i];
            for (g = 0; g < this.engine.gateSet[j].length; g++) {
                k = this.engine.gateSet[j][g];
                Δw += this.engine.errorResponsibility[k] * this.engine.extendedElegibilityTrace[j][i][k];
            }
            Δw *= this.engine.learningRate;
            this.engine.weight[j][i] += Δw;
        }
    };
    /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
    CPU.prototype.bigParenthesisTerm = function (k, j) {
        var result = this.engine.derivativeTerm[k][j] * this.engine.weight[k][k] * this.engine.state[k];
        for (var i = 0; i < this.engine.inputsOfGatedBy[k][j].length; i++) {
            var a = this.engine.inputsOfGatedBy[k][j][i];
            if (a !== k) {
                result += this.engine.weight[k][a] * this.engine.activation[a];
            }
        }
        return result;
    };
    CPU.prototype.activationFunction = function (unit) {
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
    CPU.prototype.activationFunctionDerivative = function (unit) {
        var x;
        var type = this.engine.activationFunction[unit];
        switch (type) {
            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
                x = this.engine.activation[unit];
                return x * (1 - x);
            case Engine_1.ActivationTypes.TANH:
                x = this.engine.activation[unit];
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
    CPU.prototype.costFunction = function (target, predicted, costType) {
        var i, x = 0;
        switch (costType) {
            case Trainer_1.CostTypes.MSE:
                for (i = 0; i < target.length; i++) {
                    x += Math.pow(target[i] - predicted[i], 2);
                }
                return x / target.length;
            case Trainer_1.CostTypes.CROSS_ENTROPY:
                for (i = 0; i < target.length; i++) {
                    x -= (target[i] * Math.log(predicted[i] + 1e-15)) + ((1 - target[i]) * Math.log((1 + 1e-15) - predicted[i])); // +1e-15 is a tiny push away to avoid Math.log(0)
                }
                return x;
            case Trainer_1.CostTypes.BINARY:
                for (i = 0; i < target.length; i++) {
                    x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0;
                }
                return x;
        }
    };
    CPU.prototype.activate = function (inputs) {
        this.engine.status = Engine_1.StatusTypes.ACTIVATING;
        var activation = [];
        var outputLayerIndex = this.engine.layers.length - 1;
        for (var i = 0; i < this.engine.layers.length; i++) {
            for (var j = 0; j < this.engine.layers[i].length; j++) {
                switch (i) {
                    case 0:
                        this.activateUnit(this.engine.layers[i][j], inputs[j]);
                        break;
                    case outputLayerIndex:
                        activation.push(this.activateUnit(this.engine.layers[i][j]));
                        break;
                    default:
                        this.activateUnit(this.engine.layers[i][j]);
                }
            }
        }
        this.engine.status = Engine_1.StatusTypes.IDLE;
        return activation;
    };
    CPU.prototype.propagate = function (targets) {
        this.engine.status = Engine_1.StatusTypes.PROPAGATING;
        var outputLayerIndex = this.engine.layers.length - 1;
        for (var j = this.engine.layers[outputLayerIndex].length - 1; j >= 0; j--) {
            this.propagateUnit(this.engine.layers[outputLayerIndex][j], targets[j]);
        }
        for (var i = this.engine.layers.length - 2; i > 0; i--) {
            for (var j = this.engine.layers[i].length - 1; j >= 0; j--) {
                this.propagateUnit(this.engine.layers[i][j]);
            }
        }
        this.engine.status = Engine_1.StatusTypes.IDLE;
    };
    CPU.prototype.train = function (dataset, _a) {
        var _this = this;
        var learningRate = _a.learningRate, minError = _a.minError, maxIterations = _a.maxIterations, costFunction = _a.costFunction;
        return new Promise(function (resolve) {
            // start training
            var startTime = new Date().getTime();
            var error = Infinity;
            var iterations = 0;
            _this.engine.learningRate = learningRate;
            _this.engine.status = Engine_1.StatusTypes.TRAINING;
            // train
            while (error > minError && iterations < maxIterations) {
                error = 0;
                for (var index = 0; index < dataset.length; index++) {
                    var _a = dataset[index], input = _a.input, output = _a.output;
                    var predictedOutput = _this.activate(input);
                    _this.propagate(output);
                    error += _this.costFunction(output, predictedOutput, costFunction);
                }
                error /= dataset.length;
                iterations++;
            }
            // end training
            _this.engine.status = Engine_1.StatusTypes.IDLE;
            resolve({
                error: error,
                iterations: iterations,
                time: new Date().getTime() - startTime
            });
        });
    };
    return CPU;
}());
exports.default = CPU;
//# sourceMappingURL=CPU.js.map