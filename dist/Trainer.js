"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// -- Cost Types
var CostTypes;
(function (CostTypes) {
    CostTypes[CostTypes["MSE"] = 0] = "MSE";
    CostTypes[CostTypes["CROSS_ENTROPY"] = 1] = "CROSS_ENTROPY";
    CostTypes[CostTypes["BINARY"] = 2] = "BINARY";
})(CostTypes = exports.CostTypes || (exports.CostTypes = {}));
// -- Trainer
var Trainer = (function () {
    function Trainer(network) {
        this.network = network;
    }
    Trainer.prototype.train = function (dataset, _a) {
        var _b = _a === void 0 ? {} : _a, learningRate = _b.learningRate, minError = _b.minError, maxIterations = _b.maxIterations, costFunction = _b.costFunction;
        return this.network.backend.train(dataset, {
            learningRate: learningRate || 0.3,
            minError: minError || 0.0005,
            maxIterations: maxIterations || 5000,
            costFunction: costFunction || CostTypes.MSE
        });
    };
    Trainer.prototype.test = function (dataset, options) {
        // TODO
    };
    return Trainer;
}());
Trainer.CostTypes = CostTypes;
exports.default = Trainer;
//# sourceMappingURL=Trainer.js.map