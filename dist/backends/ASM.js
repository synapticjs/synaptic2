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
var Variable = (function () {
    function Variable(id, key, value) {
        this.id = id;
        this.key = key;
        this.value = value;
    }
    return Variable;
}());
exports.Variable = Variable;
var ASM = (function () {
    function ASM(engine) {
        if (engine === void 0) { engine = new Engine_1.default(); }
        this.engine = engine;
        this.id = 0;
        this.heap = null;
        this.variables = {};
        this.activationStatements = [];
        this.propagationStatements = [];
    }
    ASM.prototype.alloc = function (key, value) {
        if (!(key in this.variables)) {
            this.variables[key] = new Variable(this.id++, key, value);
        }
        return this.variables[key];
    };
    ASM.prototype.buildActivationStatement = function () {
        var parts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parts[_i] = arguments[_i];
        }
        this.activationStatements.push(parts);
    };
    ASM.prototype.buildPropagationStatement = function () {
        var parts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parts[_i] = arguments[_i];
        }
        this.propagationStatements.push(parts);
    };
    ASM.prototype.buildActivateUnit = function (j, inputIndex) {
        var activationJ = this.alloc("activation[" + j + "]", this.engine.activation[j]);
        var i, k, h, g, to, from;
        var stateJ = this.alloc("state[" + j + "]", this.engine.state[j]);
        var isSelfConnected = this.engine.connections.some(function (connection) { return connection.to === j && connection.from === j; });
        var isSelfConnectionGated = this.engine.gates.some(function (gate) { return gate.to === j && gate.from === j; });
        if (isSelfConnected && isSelfConnectionGated) {
            var gainJJ = this.alloc("gain[" + j + "][" + j + "]", this.engine.gain[j][j]);
            var weightJJ = this.alloc("weight[" + j + "][" + j + "]", this.engine.weight[j][j]);
            this.buildActivationStatement(stateJ, '*=', gainJJ, '*', weightJJ);
        }
        else if (isSelfConnected) {
            var weightJJ = this.alloc("weight[" + j + "][" + j + "]", this.engine.weight[j][j]);
            this.buildActivationStatement(stateJ, '*=', weightJJ);
        }
        for (h = 0; h < this.engine.inputSet[j].length; h++) {
            i = this.engine.inputSet[j][h];
            var isGated = this.engine.gates.some(function (gate) { return gate.from === i && gate.to === j; });
            if (isGated) {
                var gainJI = this.alloc("gain[" + j + "][" + i + "]", this.engine.gain[j][i]);
                var weightJI = this.alloc("weight[" + j + "][" + i + "]", this.engine.weight[j][i]);
                var activationI = this.alloc("activation[" + i + "]", this.engine.activation[i]);
                this.buildActivationStatement(stateJ, '+=', gainJI, '*', weightJI, '*', activationI);
            }
            else {
                var weightJI = this.alloc("weight[" + j + "][" + i + "]", this.engine.weight[j][i]);
                var activationI = this.alloc("activation[" + i + "]", this.engine.activation[i]);
                this.buildActivationStatement(stateJ, '+=', weightJI, '*', activationI);
            }
        }
        var type = this.engine.activationFunction[j];
        switch (type) {
            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
                this.buildActivationStatement(activationJ, '=', '1.0', '/', '(1.0', '+', 'Math.exp(-', stateJ, '))');
                break;
            case Engine_1.ActivationTypes.TANH:
                var eP = this.alloc('eP', null);
                var eN = this.alloc('eN', null);
                this.buildActivationStatement(eP, '=', 'Math.exp(', stateJ, ')');
                this.buildActivationStatement(activationJ, '=', '(', eP, '-', eN, ')', '/', '(', eP, '+', eN, ')');
                break;
            case Engine_1.ActivationTypes.RELU:
                this.buildActivationStatement(activationJ, '=', stateJ, '>', '0.0', '?', stateJ, ':', '0.0');
                break;
            case Engine_1.ActivationTypes.IDENTITY:
                this.buildActivationStatement(activationJ, '=', stateJ);
                break;
        }
        for (h = 0; h < this.engine.inputSet[j].length; h++) {
            i = this.engine.inputSet[j][h];
            var gainJI = this.alloc("gain[" + j + "][" + i + "]", this.engine.gain[j][i]);
            var activationI = this.alloc("activation[" + i + "]", this.engine.activation[i]);
            var elegibilityTraceJI = this.alloc("elegibilityTrace[" + j + "][" + i + "]", this.engine.elegibilityTrace[j][i]);
            if (isSelfConnected && isSelfConnectionGated) {
                var gainJJ = this.alloc("gain[" + j + "][" + j + "]", this.engine.gain[j][j]);
                var weightJJ = this.alloc("weight[" + j + "][" + j + "]", this.engine.weight[j][j]);
                this.buildActivationStatement(elegibilityTraceJI, '=', gainJJ, '*', weightJJ, '*', elegibilityTraceJI, '+', gainJI, '*', activationI);
            }
            else if (isSelfConnected) {
                var weightJJ = this.alloc("weight[" + j + "][" + j + "]", this.engine.weight[j][j]);
                this.buildActivationStatement(elegibilityTraceJI, '=', weightJJ, '*', elegibilityTraceJI, '+', gainJI, '*', activationI);
            }
            else {
                this.buildActivationStatement(elegibilityTraceJI, '=', gainJI, '*', activationI);
            }
            for (g = 0; g < this.engine.gatedBy[j].length; g++) {
                k = this.engine.gatedBy[j][g];
                var isSelfConnectedK = this.engine.connections.some(function (connection) { return connection.to === k && connection.from === k; });
                var isSelfConnectionGatedK = this.engine.gates.some(function (gate) { return gate.to === k && gate.from === k; });
                var derivativeJ = this.alloc("derivative[" + j + "]", this.engine.derivative[j]);
                var type_1 = this.engine.activationFunction[j];
                switch (type_1) {
                    case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
                        this.buildActivationStatement(derivativeJ, '=', activationJ, '*', '(', '1.0', '-', activationJ, ')');
                        break;
                    case Engine_1.ActivationTypes.TANH:
                        this.buildActivationStatement(derivativeJ, '=', '1.0', '-', 'Math.pow', '(', activationJ, ',', '2.0', ')');
                        break;
                    case Engine_1.ActivationTypes.RELU:
                    case Engine_1.ActivationTypes.IDENTITY:
                    case Engine_1.ActivationTypes.MAX_POOLING:
                    case Engine_1.ActivationTypes.DROPOUT:
                        break;
                }
                var bigParenthesisTermResult = this.alloc('bigParenthesisTermResult', null);
                var keepBigParenthesisTerm = false;
                var initializeBigParenthesisTerm = false;
                if (isSelfConnectedK && this.engine.derivativeTerm[k][j]) {
                    var stateK = this.alloc("state[" + k + "]", this.engine.state[k]);
                    this.buildActivationStatement(bigParenthesisTermResult, '=', stateK);
                    keepBigParenthesisTerm = true;
                }
                else {
                    initializeBigParenthesisTerm = true;
                }
                for (var l = 0; l < this.engine.inputsOfGatedBy[k][j].length; l++) {
                    var a = this.engine.inputsOfGatedBy[k][j][l];
                    if (a !== k) {
                        if (initializeBigParenthesisTerm) {
                            this.buildActivationStatement(bigParenthesisTermResult, '=', '0.0');
                            initializeBigParenthesisTerm = false;
                        }
                        var weightKA = this.alloc("weight[" + k + "][" + a + "]", this.engine.weight[k][a]);
                        var activationA = this.alloc("activation[" + a + "]", this.engine.activation[a]);
                        this.buildActivationStatement(bigParenthesisTermResult, '+=', weightKA, '*', activationA);
                        keepBigParenthesisTerm = true;
                    }
                }
                var extendedElegibilityTraceJIK = this.alloc("extendedElegibilityTrace[" + j + "][" + i + "][" + k + "]", this.engine.extendedElegibilityTrace[j][i][k]);
                if (isSelfConnected && isSelfConnectionGated) {
                    var gainKK = this.alloc("gain[" + k + "][" + k + "]", this.engine.gain[k][k]);
                    var weightKK = this.alloc("weight[" + k + "][" + k + "]", this.engine.weight[k][k]);
                    if (keepBigParenthesisTerm) {
                        this.buildActivationStatement(extendedElegibilityTraceJIK, '=', gainKK, '*', weightKK, '*', extendedElegibilityTraceJIK, '+', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult);
                    }
                    else {
                        this.buildActivationStatement(extendedElegibilityTraceJIK, '=', gainKK, '*', weightKK, '*', extendedElegibilityTraceJIK);
                    }
                }
                else if (isSelfConnected) {
                    var weightKK = this.alloc("weight[" + k + "][" + k + "]", this.engine.weight[k][k]);
                    if (keepBigParenthesisTerm) {
                        this.buildActivationStatement(extendedElegibilityTraceJIK, '=', weightKK, '*', extendedElegibilityTraceJIK, '+', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult);
                    }
                    else {
                        this.buildActivationStatement(extendedElegibilityTraceJIK, '=', weightKK, '*', extendedElegibilityTraceJIK);
                    }
                }
                else {
                    if (keepBigParenthesisTerm) {
                        this.buildActivationStatement(extendedElegibilityTraceJIK, '=', derivativeJ, '*', elegibilityTraceJI, '*', bigParenthesisTermResult);
                    }
                }
            }
        }
        for (h = 0; h < this.engine.gatedBy[j].length; h++) {
            to = this.engine.gatedBy[j][h];
            for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
                from = this.engine.inputsOfGatedBy[to][j][g];
                var gainToFrom = this.alloc("gain[" + to + "][" + from + "]", this.engine.gain[to][from]);
                this.buildActivationStatement(gainToFrom, '=', activationJ);
            }
        }
    };
    ASM.prototype.propagateUnit = function (j, target) {
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
    ASM.prototype.costFunction = function (target, predicted, costType) {
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
    ASM.prototype.activate = function (inputs) {
        this.engine.status = Engine_1.StatusTypes.ACTIVATING;
        if (!this.activateFn) {
            this.activationStatements = [];
            var outputLayerIndex = this.engine.layers.length - 1;
            for (var i = 0; i < this.engine.layers.length; i++) {
                for (var j = 0; j < this.engine.layers[i].length; j++) {
                    var activationJ = void 0;
                    switch (i) {
                        case 0:
                            activationJ = this.alloc("activation[" + j + "]", this.engine.activation[j]);
                            this.buildActivationStatement(activationJ, '=', "input[" + j + "]");
                            break;
                        case outputLayerIndex:
                            activationJ = this.buildActivateUnit(this.engine.layers[i][j]);
                            this.buildActivationStatement("output[" + j + "]", '=', activationJ);
                            break;
                        default:
                            this.buildActivateUnit(this.engine.layers[i][j]);
                    }
                }
            }
            //this.activateFn = this.buildActivate()
        }
        var activation = this.activateFn(inputs);
        this.engine.status = Engine_1.StatusTypes.IDLE;
        return activation;
    };
    ASM.prototype.propagate = function (targets) {
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
    ASM.prototype.train = function (dataset, _a) {
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
    return ASM;
}());
exports.default = ASM;
//# sourceMappingURL=ASM.js.map