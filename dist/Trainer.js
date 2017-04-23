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
// -- Cost Types
var CostTypes;
(function (CostTypes) {
    CostTypes[CostTypes["MEAN_SQUARE_ERROR"] = 0] = "MEAN_SQUARE_ERROR";
    CostTypes[CostTypes["CROSS_ENTROPY"] = 1] = "CROSS_ENTROPY";
    CostTypes[CostTypes["BINARY"] = 2] = "BINARY";
})(CostTypes = exports.CostTypes || (exports.CostTypes = {}));
// -- Trainer
var Trainer = (function () {
    function Trainer(network) {
        this.network = network;
    }
    Trainer.prototype.train = function (dataset, _a) {
        var _b = _a.learningRate, learningRate = _b === void 0 ? 0.3 : _b, _c = _a.minError, minError = _c === void 0 ? 0.05 : _c, _d = _a.maxIterations, maxIterations = _d === void 0 ? 1000 : _d, _e = _a.costFunction, costFunction = _e === void 0 ? CostTypes.MEAN_SQUARE_ERROR : _e;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.network.backend.train(dataset, {
                            learningRate: learningRate,
                            minError: minError,
                            maxIterations: maxIterations,
                            costFunction: costFunction
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
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