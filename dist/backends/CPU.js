// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Engine_1 = require("../Engine");
var Trainer_1 = require("../Trainer");
var CPU = (function () {
    function CPU(engine) {
        if (engine === void 0) { engine = new Engine_1.default(); }
        this.engine = engine;
        this.inputUnitsActivation = [];
        this.hiddenUnitsActivation = [];
        this.outputUnitsActivation = [];
        this.hiddenUnitsPropagation = [];
        this.outputUnitsPropagation = [];
        this.cached = false;
    }
    CPU.prototype.cache = function () {
        this.inputUnitsActivation = [];
        this.hiddenUnitsActivation = [];
        this.outputUnitsActivation = [];
        this.outputUnitsPropagation = [];
        this.hiddenUnitsPropagation = [];
        var outputLayerIndex = this.engine.layers.length - 1;
        for (var i = 0; i < this.engine.layers.length; i++) {
            for (var j = 0; j < this.engine.layers[i].length; j++) {
                switch (i) {
                    case 0:
                        this.inputUnitsActivation.push(this.engine.layers[i][j]);
                        break;
                    case outputLayerIndex:
                        this.outputUnitsActivation.push(this.engine.layers[i][j]);
                        break;
                    default:
                        this.hiddenUnitsActivation.push(this.engine.layers[i][j]);
                }
            }
        }
        for (var j = this.engine.layers[outputLayerIndex].length - 1; j >= 0; j--) {
            this.outputUnitsPropagation.push(this.engine.layers[outputLayerIndex][j]);
        }
        for (var i = this.engine.layers.length - 2; i > 0; i--) {
            for (var j = this.engine.layers[i].length - 1; j >= 0; j--) {
                this.hiddenUnitsPropagation.push(this.engine.layers[i][j]);
            }
        }
        this.cached = true;
    };
    CPU.prototype.activateUnit = function (j, input) {
        if (input !== null) {
            this.engine.activation[j] = input;
        }
        else {
            var i = void 0, k = void 0, h = void 0, g = void 0, to = void 0, from = void 0;
            this.engine.state[j] *= this.engine.gain[j][j] * this.engine.weight[j][j];
            for (h = 0; h < this.engine.inputSet[j].length; h++) {
                i = this.engine.inputSet[j][h];
                this.engine.state[j] += this.engine.gain[j][i] * this.engine.weight[j][i] * this.engine.activation[i];
            }
            this.engine.activation[j] = this.activationFunction(j);
            this.engine.derivative[j] = this.activationFunctionDerivative(j);
            for (h = 0; h < this.engine.inputSet[j].length; h++) {
                i = this.engine.inputSet[j][h];
                this.engine.elegibilityTrace[j][i] = this.engine.gain[j][j] * this.engine.weight[j][j] * this.engine.elegibilityTrace[j][i] + this.engine.gain[j][i] * this.engine.activation[i];
                for (g = 0; g < this.engine.gatedBy[j].length; g++) {
                    k = this.engine.gatedBy[j][g];
                    this.engine.extendedElegibilityTrace[j][i][k] = this.engine.gain[k][k] * this.engine.weight[k][k] * this.engine.extendedElegibilityTrace[j][i][k] + this.engine.derivative[j] * this.engine.elegibilityTrace[j][i] * this.bigParenthesisTerm(k, j);
                }
            }
            for (h = 0; h < this.engine.gatedBy[j].length; h++) {
                to = this.engine.gatedBy[j][h];
                for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
                    from = this.engine.inputsOfGatedBy[to][j][g];
                    this.engine.gain[to][from] = this.engine.activation[j];
                }
            }
        }
        return this.engine.activation[j];
    };
    CPU.prototype.propagateUnit = function (j, target) {
        var i, k, h, g;
        if (target !== null) {
            this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] = target - this.engine.activation[j];
        }
        else {
            this.engine.projectedErrorResponsibility[j] = 0;
            for (h = 0; h < this.engine.projectionSet[j].length; h++) {
                k = this.engine.projectionSet[j][h];
                this.engine.projectedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.engine.gain[k][j] * this.engine.weight[k][j];
            }
            this.engine.projectedErrorResponsibility[j] *= this.engine.derivative[j];
            this.engine.gatedErrorResponsibility[j] = 0;
            for (h = 0; h < this.engine.gateSet[j].length; h++) {
                k = this.engine.gateSet[j][h];
                this.engine.gatedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.bigParenthesisTerm(k, j);
            }
            this.engine.gatedErrorResponsibility[j] *= this.engine.derivative[j];
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
            case Trainer_1.CostTypes.MEAN_SQUARE_ERROR:
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
        if (!this.cached) {
            this.cache();
        }
        this.engine.status = Engine_1.StatusTypes.ACTIVATING;
        var activation = [];
        var i;
        for (i = 0; i < this.inputUnitsActivation.length; i++) {
            this.activateUnit(this.inputUnitsActivation[i], inputs[i]);
        }
        for (i = 0; i < this.hiddenUnitsActivation.length; i++) {
            this.activateUnit(this.hiddenUnitsActivation[i], null);
        }
        for (i = 0; i < this.outputUnitsActivation.length; i++) {
            activation.push(this.activateUnit(this.outputUnitsActivation[i], null));
        }
        this.engine.status = Engine_1.StatusTypes.IDLE;
        return activation;
    };
    CPU.prototype.propagate = function (targets) {
        this.engine.status = Engine_1.StatusTypes.PROPAGATING;
        var i;
        for (i = 0; i < this.outputUnitsPropagation.length; i++) {
            this.propagateUnit(this.outputUnitsPropagation[i], targets[i]);
        }
        for (i = 0; i < this.hiddenUnitsPropagation.length; i++) {
            this.propagateUnit(this.hiddenUnitsPropagation[i], null);
        }
        this.engine.status = Engine_1.StatusTypes.IDLE;
    };
    CPU.prototype.train = function (dataset, _a) {
        var learningRate = _a.learningRate, minError = _a.minError, maxIterations = _a.maxIterations, costFunction = _a.costFunction;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, error, iterations, index, _a, input, output, predictedOutput;
            return __generator(this, function (_b) {
                startTime = new Date().getTime();
                error = Infinity;
                iterations = 0;
                this.engine.learningRate = learningRate;
                this.engine.status = Engine_1.StatusTypes.TRAINING;
                // train
                while (error > minError && iterations < maxIterations) {
                    error = 0;
                    for (index = 0; index < dataset.length; index++) {
                        _a = dataset[index], input = _a.input, output = _a.output;
                        predictedOutput = this.activate(input);
                        this.propagate(output);
                        error += this.costFunction(output, predictedOutput, costFunction);
                    }
                    error /= dataset.length;
                    iterations++;
                }
                // end training
                this.engine.status = Engine_1.StatusTypes.IDLE;
                return [2 /*return*/, {
                        error: error,
                        iterations: iterations,
                        time: new Date().getTime() - startTime
                    }];
            });
        });
    };
    return CPU;
}());
exports.default = CPU;
//# sourceMappingURL=CPU.js.map